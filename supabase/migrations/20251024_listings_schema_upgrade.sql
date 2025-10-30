-- Align listings schema with application expectations prior to advanced RPCs.

alter table public.listings
  add column if not exists owner_id uuid references auth.users(id),
  add column if not exists weekly_price int,
  add column if not exists min_stay_weeks int default 4,
  add column if not exists pet_rules jsonb default '{}'::jsonb,
  add column if not exists safety jsonb default '{}'::jsonb,
  add column if not exists thumb_url text,
  add column if not exists video_url text,
  add column if not exists status text default 'active' check (status in ('active','draft','snoozed'));

-- Backfill new columns from legacy fields when available.
update public.listings
set owner_id = coalesce(owner_id, host_id)
where host_id is not null
  and owner_id is distinct from host_id;

update public.listings
set weekly_price = coalesce(weekly_price, round(coalesce(nightly_rate, 0)::numeric * 7)::int)
where weekly_price is null;

update public.listings
set status = case
  when status is not null then status
  when is_active is not null then case when is_active then 'active' else 'draft' end
  else 'active'
end;

-- Ensure timestamps remain consistent on updates triggered above.
update public.listings set updated_at = now() where true;
