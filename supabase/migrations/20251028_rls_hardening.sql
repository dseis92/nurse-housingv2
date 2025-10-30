-- Consolidate RLS policies and adopt recommended auth.uid() usage.

-- Profiles -------------------------------------------------------------------
drop policy if exists "profiles_select_self" on public.profiles;
drop policy if exists "profiles_update_self" on public.profiles;
drop policy if exists "profiles_insert_self" on public.profiles;

create policy "profiles_select_self"
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

create policy "profiles_update_self"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "profiles_insert_self"
on public.profiles for insert
to authenticated
with check (id = (select auth.uid()));

-- Contracts ------------------------------------------------------------------
drop policy if exists "contracts_self" on public.contracts;
drop policy if exists "contracts_rw_self" on public.contracts;

create policy "contracts_select_self"
on public.contracts for select
to authenticated
using (nurse_user_id = (select auth.uid()));

create policy "contracts_insert_self"
on public.contracts for insert
to authenticated
with check (nurse_user_id = (select auth.uid()));

create policy "contracts_update_self"
on public.contracts for update
to authenticated
using (nurse_user_id = (select auth.uid()))
with check (nurse_user_id = (select auth.uid()));

create policy "contracts_delete_self"
on public.contracts for delete
to authenticated
using (nurse_user_id = (select auth.uid()));

-- Nurse profiles -------------------------------------------------------------
drop policy if exists "nurse_profiles select self" on public.nurse_profiles;
drop policy if exists "nurse_profiles:select self" on public.nurse_profiles;
drop policy if exists "nurse_profiles upsert self" on public.nurse_profiles;
drop policy if exists "nurse_profiles:upsert self" on public.nurse_profiles;
drop policy if exists "nurse_profiles:update self" on public.nurse_profiles;

create policy "nurse_profiles_select_self"
on public.nurse_profiles for select
to authenticated
using (user_id = (select auth.uid()));

create policy "nurse_profiles_insert_self"
on public.nurse_profiles for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "nurse_profiles_update_self"
on public.nurse_profiles for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "nurse_profiles_delete_self"
on public.nurse_profiles for delete
to authenticated
using (user_id = (select auth.uid()));

-- Nurse onboarding -----------------------------------------------------------
drop policy if exists "nurse_onboarding upsert self" on public.nurse_onboarding;
drop policy if exists "nurse_onboarding select self" on public.nurse_onboarding;
drop policy if exists "read own onboarding" on public.nurse_onboarding;
drop policy if exists "upsert own onboarding" on public.nurse_onboarding;

create policy "nurse_onboarding_select_self"
on public.nurse_onboarding for select
to authenticated
using (user_id = (select auth.uid()));

create policy "nurse_onboarding_insert_self"
on public.nurse_onboarding for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "nurse_onboarding_update_self"
on public.nurse_onboarding for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "nurse_onboarding_delete_self"
on public.nurse_onboarding for delete
to authenticated
using (user_id = (select auth.uid()));

-- Likes ----------------------------------------------------------------------
drop policy if exists "likes_self" on public.likes;
create policy "likes_self"
on public.likes for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- Matches --------------------------------------------------------------------
drop policy if exists "matches_participants" on public.matches;
drop policy if exists "matches_update_participants" on public.matches;

create policy "matches_select_participants"
on public.matches for select
to authenticated
using ((select auth.uid()) in (nurse_user_id, owner_user_id));

create policy "matches_insert_participants"
on public.matches for insert
to authenticated
with check ((select auth.uid()) in (nurse_user_id, owner_user_id));

create policy "matches_update_participants"
on public.matches for update
to authenticated
using ((select auth.uid()) in (nurse_user_id, owner_user_id))
with check ((select auth.uid()) in (nurse_user_id, owner_user_id));

create policy "matches_delete_participants"
on public.matches for delete
to authenticated
using ((select auth.uid()) in (nurse_user_id, owner_user_id));

-- Conversations --------------------------------------------------------------
drop policy if exists "conversations_participants" on public.conversations;

create policy "conversations_access_participants"
on public.conversations for all
to authenticated
using (
  (select auth.uid()) in (nurse_user_id, owner_user_id)
)
with check (
  (select auth.uid()) in (nurse_user_id, owner_user_id)
);

-- Messages -------------------------------------------------------------------
drop policy if exists "messages_participants" on public.messages;

create policy "messages_access_participants"
on public.messages for all
to authenticated
using (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (select auth.uid()) in (c.nurse_user_id, c.owner_user_id)
  )
)
with check (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (select auth.uid()) in (c.nurse_user_id, c.owner_user_id)
  )
);

-- Listings -------------------------------------------------------------------
drop policy if exists "host insert listings" on public.listings;
drop policy if exists "host update listings" on public.listings;
drop policy if exists "host delete listings" on public.listings;

create policy "listings_insert_owner"
on public.listings for insert
to authenticated
with check (coalesce(owner_id, host_id) = (select auth.uid()));

create policy "listings_update_owner"
on public.listings for update
to authenticated
using (coalesce(owner_id, host_id) = (select auth.uid()))
with check (coalesce(owner_id, host_id) = (select auth.uid()));

create policy "listings_delete_owner"
on public.listings for delete
to authenticated
using (coalesce(owner_id, host_id) = (select auth.uid()));

-- Bookings -------------------------------------------------------------------
drop policy if exists "guest insert bookings" on public.bookings;
drop policy if exists "guest read bookings" on public.bookings;
drop policy if exists "admin update bookings" on public.bookings;

create policy "bookings_insert_guest"
on public.bookings for insert
to authenticated
with check (guest_id = (select auth.uid()));

create policy "bookings_select_participants"
on public.bookings for select
to authenticated
using (
  guest_id = (select auth.uid())
  or exists (
    select 1
    from public.listings l
    where l.id = listing_id and coalesce(l.owner_id, l.host_id) = (select auth.uid())
  )
);

create policy "bookings_update_admin_or_guest"
on public.bookings for update
to authenticated
using (
  (select auth.role()) = 'service_role'
  or guest_id = (select auth.uid())
)
with check (
  (select auth.role()) = 'service_role'
  or guest_id = (select auth.uid())
);

-- Booking line items ---------------------------------------------------------
drop policy if exists "line items access" on public.booking_line_items;

create policy "booking_line_items_access"
on public.booking_line_items for all
to authenticated
using (
  exists (
    select 1
    from public.bookings b
    where b.id = booking_id
      and (
        b.guest_id = (select auth.uid())
        or exists (
          select 1
          from public.listings l
          where l.id = b.listing_id
            and coalesce(l.owner_id, l.host_id) = (select auth.uid())
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.bookings b
    where b.id = booking_id
      and b.guest_id = (select auth.uid())
  )
);

-- Orders sample tables (cleanup duplicate policies) --------------------------
drop policy if exists "anon can insert orders" on public.orders;
drop policy if exists "anon can insert lines" on public.order_lines;

-- Remove duplicate index on orders.created_at
drop index if exists public.idx_orders_created_at;
