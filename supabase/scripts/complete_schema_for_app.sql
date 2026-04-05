-- Run in Supabase SQL Editor (or psql) to align an existing database with the Next.js app.
-- This mirrors supabase/migrations/* and fixes common gaps. All steps are idempotent where possible.

-- ---------------------------------------------------------------------------
-- events.registration_open (required: createEvent, updateEventSettings, registration gating)
-- ---------------------------------------------------------------------------
alter table public.events
  add column if not exists registration_open boolean default true;

update public.events
set registration_open = true
where registration_open is null;

alter table public.events
  alter column registration_open set default true;

alter table public.events
  alter column registration_open set not null;

-- ---------------------------------------------------------------------------
-- registrants.qr_data + unique partial index (migration 202603140001)
-- If migration failed earlier because qr_url was missing, add a harmless legacy column:
-- ---------------------------------------------------------------------------
alter table public.registrants
  add column if not exists qr_url text;

alter table public.registrants
  add column if not exists qr_data text;

-- Same backfill as migration 202603140001 (legacy rows with qr_url)
update public.registrants
set qr_data = md5(
  concat(
    coalesce(registrant_id::text, ''),
    ':',
    coalesce(event_id::text, ''),
    ':',
    coalesce(users_id::text, ''),
    ':',
    clock_timestamp()::text,
    ':',
    random()::text
  )
)
where qr_url is not null
  and qr_data is null;

-- Registered attendees still missing qr_data (e.g. DB had no qr_url column)
update public.registrants
set qr_data = md5(
  concat(
    coalesce(registrant_id::text, ''),
    ':',
    coalesce(event_id::text, ''),
    ':',
    coalesce(users_id::text, ''),
    ':',
    clock_timestamp()::text,
    ':',
    random()::text
  )
)
where qr_data is null
  and is_registered = true;

create unique index if not exists registrants_qr_data_key
  on public.registrants (qr_data)
  where qr_data is not null;

-- ---------------------------------------------------------------------------
-- registrants.check_in_time (migration 202603150001)
-- ---------------------------------------------------------------------------
alter table public.registrants
  add column if not exists check_in_time timestamptz;

-- ---------------------------------------------------------------------------
-- Mirror auth.users -> public.users (migration 202604050002)
-- Sign-up only creates auth users; the app does not insert public.users itself.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (users_id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'first_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'last_name'), ''),
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'role'), ''),
      'authenticated'
    )
  )
  on conflict (users_id) do update set
    email = excluded.email,
    first_name = coalesce(excluded.first_name, public.users.first_name),
    last_name = coalesce(excluded.last_name, public.users.last_name),
    role = coalesce(nullif(excluded.role, ''), public.users.role);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

insert into public.users (users_id, email, first_name, last_name, role)
select
  au.id,
  au.email,
  nullif(trim(au.raw_user_meta_data ->> 'first_name'), ''),
  nullif(trim(au.raw_user_meta_data ->> 'last_name'), ''),
  coalesce(
    nullif(trim(au.raw_user_meta_data ->> 'role'), ''),
    'authenticated'
  )
from auth.users au
where not exists (
  select 1 from public.users pu where pu.users_id = au.id
)
on conflict (users_id) do nothing;

-- ---------------------------------------------------------------------------
-- Fix dangerous FK defaults (migration 202604050003)
-- FK columns should never default to gen_random_uuid() — that silently inserts
-- orphan rows if the app forgets to supply the value.
-- ---------------------------------------------------------------------------
alter table public.registrants
  alter column event_id drop default;

alter table public.registrants
  alter column users_id drop default;

-- ---------------------------------------------------------------------------
-- Missing FK indexes (migration 202604050003)  [schema-foreign-key-indexes]
-- Postgres does NOT auto-index FK columns.
-- ---------------------------------------------------------------------------
create index if not exists registrants_event_id_idx
  on public.registrants (event_id);

create index if not exists registrants_users_id_idx
  on public.registrants (users_id);

create index if not exists events_organizer_id_idx
  on public.events (organizer_id);

create index if not exists survey_responses_event_id_idx
  on public.survey_responses (event_id);

create index if not exists survey_responses_users_id_idx
  on public.survey_responses (users_id);

-- Hot-path composite index: most registrant queries filter (event_id, is_registered).
create index if not exists registrants_event_is_registered_idx
  on public.registrants (event_id, is_registered);

-- Case-insensitive email lookup via pg_trgm GIN (findUserByEmail uses .ilike).
create extension if not exists pg_trgm;
create index if not exists users_email_trgm_idx
  on public.users using gin (email gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- RLS helper functions (migration 202604050003)  [security-rls-performance]
-- SECURITY DEFINER + (select auth.uid()) avoids per-row function calls.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.users
    where users_id = (select auth.uid())
      and role = 'admin'
  );
$$;

create or replace function public.is_event_organizer(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.events
    where event_id = p_event_id
      and organizer_id = (select auth.uid())
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security (migration 202604050003)  [security-rls-basics]
-- Without RLS, any anon/authenticated user via the publishable key can read
-- ALL rows in ALL tables.
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.events enable row level security;
alter table public.registrants enable row level security;
alter table public.survey_responses enable row level security;

-- users
create policy users_select_authenticated on public.users
  for select to authenticated using (true);

create policy users_update_own on public.users
  for update to authenticated
  using   (users_id = (select auth.uid()))
  with check (users_id = (select auth.uid()));

-- events
create policy events_select_all on public.events
  for select using (true);

create policy events_insert_auth on public.events
  for insert to authenticated
  with check (organizer_id = (select auth.uid()));

create policy events_update_organizer on public.events
  for update to authenticated
  using   (organizer_id = (select auth.uid()) or (select public.is_admin()))
  with check (organizer_id = (select auth.uid()) or (select public.is_admin()));

create policy events_delete_organizer on public.events
  for delete to authenticated
  using (organizer_id = (select auth.uid()) or (select public.is_admin()));

-- registrants
create policy registrants_select on public.registrants
  for select to authenticated
  using (
    users_id = (select auth.uid())
    or (select public.is_admin())
    or (select public.is_event_organizer(event_id))
  );

create policy registrants_insert_own on public.registrants
  for insert to authenticated
  with check (users_id = (select auth.uid()));

create policy registrants_update on public.registrants
  for update to authenticated
  using (
    users_id = (select auth.uid())
    or (select public.is_admin())
    or (select public.is_event_organizer(event_id))
  );

create policy registrants_delete on public.registrants
  for delete to authenticated
  using (
    (select public.is_admin())
    or (select public.is_event_organizer(event_id))
  );

-- survey_responses
create policy survey_responses_select on public.survey_responses
  for select to authenticated
  using (
    users_id = (select auth.uid())
    or (select public.is_admin())
    or (select public.is_event_organizer(event_id))
  );

create policy survey_responses_insert_own on public.survey_responses
  for insert to authenticated
  with check (users_id = (select auth.uid()));

create policy survey_responses_update_own on public.survey_responses
  for update to authenticated
  using   (users_id = (select auth.uid()))
  with check (users_id = (select auth.uid()));
