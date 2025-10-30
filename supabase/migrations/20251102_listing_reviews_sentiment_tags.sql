-- Ensure listing_reviews can store structured sentiment tags

alter table public.listing_reviews
  add column if not exists sentiment_tags text[];
