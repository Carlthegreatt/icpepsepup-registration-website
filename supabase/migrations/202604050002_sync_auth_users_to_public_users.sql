-- App sign-up only creates auth.users + raw_user_meta_data; it never inserts public.users.
-- Foreign keys (registrants, events.organizer_id, etc.) require a matching public.users row.

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

-- One-time: users who signed up before this trigger existed
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
