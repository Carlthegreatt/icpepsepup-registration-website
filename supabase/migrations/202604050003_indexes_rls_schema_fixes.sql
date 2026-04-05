-- Fixes three categories of issues identified by code audit + supabase-postgres-best-practices:
--   1. Missing indexes on FK columns and hot query paths            (schema-foreign-key-indexes)
--   2. Dangerous DEFAULT gen_random_uuid() on FK columns            (schema-data-types)
--   3. Row Level Security missing on all tables                     (security-rls-basics / security-rls-performance)
--
-- All DDL is idempotent (IF NOT EXISTS / OR REPLACE / CREATE OR REPLACE).

-- ============================================================
-- 1. REMOVE DANGEROUS FK DEFAULTS
-- ============================================================
-- registrants.event_id: NOT NULL FK with DEFAULT gen_random_uuid() silently
-- inserts a random UUID that can never satisfy the FK if omitted in code.
-- The app always provides event_id explicitly in createRegistrant().
alter table public.registrants
  alter column event_id drop default;

-- registrants.users_id: nullable FK — same risk (random UUID != any user row).
-- App always provides users_id explicitly.
alter table public.registrants
  alter column users_id drop default;

-- ============================================================
-- 2. MISSING FK INDEXES  (schema-foreign-key-indexes)
-- Postgres does NOT auto-index FK columns. All joins and ON DELETE
-- CASCADE operations will do full sequential scans without these.
-- ============================================================

-- registrants.event_id → events.event_id
-- Used in nearly every registrant lookup and event deletion cascade.
create index if not exists registrants_event_id_idx
  on public.registrants (event_id);

-- registrants.users_id → users.users_id
-- Used in guest list joins: users!users_id (first_name, last_name, email).
create index if not exists registrants_users_id_idx
  on public.registrants (users_id);

-- events.organizer_id → users.users_id
-- Used in canManageEvent() and admin lookups.
create index if not exists events_organizer_id_idx
  on public.events (organizer_id);

-- survey_responses.event_id → events.event_id
create index if not exists survey_responses_event_id_idx
  on public.survey_responses (event_id);

-- survey_responses.users_id → users.users_id
create index if not exists survey_responses_users_id_idx
  on public.survey_responses (users_id);

-- ============================================================
-- 3. COMPOSITE / PARTIAL INDEXES FOR HOT QUERY PATHS
-- (query-missing-indexes, query-partial-indexes)
-- ============================================================

-- Most common registrant query: all registrants for an event filtered by status.
-- getRegistrantsByEvent, getRegistrantCountByEventSlug all filter (event_id, is_registered).
create index if not exists registrants_event_is_registered_idx
  on public.registrants (event_id, is_registered);

-- QR code lookup — already has a partial unique index from migration 202603140001
-- but the covering columns are not included. Separate lookup index is fine.
-- (registrants_qr_data_key already exists if migration ran correctly)

-- users.email case-insensitive lookup (findUserByEmail uses .ilike).
-- pg_trgm enables GIN index that supports ILIKE without wildcards too.
create extension if not exists pg_trgm;

create index if not exists users_email_trgm_idx
  on public.users using gin (email gin_trgm_ops);

-- ============================================================
-- 4. HELPER FUNCTIONS FOR RLS  (security-rls-performance)
-- Wrap role checks in SECURITY DEFINER + stable functions so the
-- check is executed ONCE per query, not once per row.
-- set search_path = '' prevents search-path-injection attacks.
-- ============================================================

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

-- ============================================================
-- 5. ROW LEVEL SECURITY  (security-rls-basics, security-rls-performance)
-- Without RLS every row of every table is visible to anon and any
-- authenticated user via the publishable (anon) key.
-- ============================================================

-- ---- public.users ----
alter table public.users enable row level security;

-- Any authenticated user can read user profiles.
-- Required because organizer guest-list queries JOIN registrants → users
-- and the current user is never the organizer of every registrant row.
create policy users_select_authenticated
  on public.users
  for select
  to authenticated
  using (true);

-- Users may only update their own profile row.
create policy users_update_own
  on public.users
  for update
  to authenticated
  using   (users_id = (select auth.uid()))
  with check (users_id = (select auth.uid()));

-- Inserts are handled exclusively by the handle_new_user() trigger
-- which is SECURITY DEFINER and bypasses RLS. No INSERT policy needed.


-- ---- public.events ----
alter table public.events enable row level security;

-- Public event listing page is unauthenticated; allow anon reads.
create policy events_select_all
  on public.events
  for select
  using (true);

-- Only authenticated users can create events; they become the organizer.
create policy events_insert_auth
  on public.events
  for insert
  to authenticated
  with check (organizer_id = (select auth.uid()));

-- Only the event organizer or an admin may update event details / settings.
create policy events_update_organizer
  on public.events
  for update
  to authenticated
  using   (organizer_id = (select auth.uid()) or (select public.is_admin()))
  with check (organizer_id = (select auth.uid()) or (select public.is_admin()));

create policy events_delete_organizer
  on public.events
  for delete
  to authenticated
  using (organizer_id = (select auth.uid()) or (select public.is_admin()));


-- ---- public.registrants ----
alter table public.registrants enable row level security;

-- Users see their own registrations.
-- Organizers and admins see all registrants for the events they manage.
create policy registrants_select
  on public.registrants
  for select
  to authenticated
  using (
    users_id = (select auth.uid())
    or (select public.is_admin())
    or (select public.is_event_organizer(event_id))
  );

-- A user may only register themselves (users_id must equal own auth.uid()).
create policy registrants_insert_own
  on public.registrants
  for insert
  to authenticated
  with check (users_id = (select auth.uid()));

-- Users update their own row; organizers/admins may update any row for their event.
create policy registrants_update
  on public.registrants
  for update
  to authenticated
  using (
    users_id = (select auth.uid())
    or (select public.is_admin())
    or (select public.is_event_organizer(event_id))
  );

-- Only organizers/admins may delete registrant rows.
create policy registrants_delete
  on public.registrants
  for delete
  to authenticated
  using (
    (select public.is_admin())
    or (select public.is_event_organizer(event_id))
  );


-- ---- public.survey_responses ----
alter table public.survey_responses enable row level security;

create policy survey_responses_select
  on public.survey_responses
  for select
  to authenticated
  using (
    users_id = (select auth.uid())
    or (select public.is_admin())
    or (select public.is_event_organizer(event_id))
  );

create policy survey_responses_insert_own
  on public.survey_responses
  for insert
  to authenticated
  with check (users_id = (select auth.uid()));

create policy survey_responses_update_own
  on public.survey_responses
  for update
  to authenticated
  using   (users_id = (select auth.uid()))
  with check (users_id = (select auth.uid()));
