alter table public.registrants
  add column if not exists qr_url text;

alter table public.registrants
  add column if not exists qr_data text;

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

create unique index if not exists registrants_qr_data_key
on public.registrants (qr_data)
where qr_data is not null;