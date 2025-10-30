-- Listing reviews table to store nurse feedback with sentiment tags.

create table if not exists public.listing_reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reviewer_name text,
  reviewer_role text,
  rating numeric(3,2) not null check (rating >= 0 and rating <= 5),
  body text,
  stay_type text,
  sentiment_tags text[] default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_listing_reviews_listing_created
  on public.listing_reviews (listing_id, created_at desc);

alter table public.listing_reviews enable row level security;

drop policy if exists "listing_reviews_select" on public.listing_reviews;
create policy "listing_reviews_select"
on public.listing_reviews for select
to authenticated
using (true);

drop policy if exists "listing_reviews_insert" on public.listing_reviews;
create policy "listing_reviews_insert"
on public.listing_reviews for insert
to authenticated
with check (true);
