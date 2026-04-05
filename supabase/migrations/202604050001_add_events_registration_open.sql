-- App expects public.events.registration_open (see eventRepository, eventService.createEvent).
-- Idempotent: safe if the column already exists.

alter table public.events
  add column if not exists registration_open boolean default true;

update public.events
set registration_open = true
where registration_open is null;

alter table public.events
  alter column registration_open set default true;

alter table public.events
  alter column registration_open set not null;

comment on column public.events.registration_open is
  'When false, public registration is closed; managed from admin event settings.';
