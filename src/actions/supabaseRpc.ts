import { ensureSupabase } from '../lib/supabaseClient'

/** Right-swipe (like). Calls public.user_like_listing(p_listing_id uuid) which may return { match_id }. */
export async function rpcUserLikeListing(listingId: string) {
  const sb = await ensureSupabase()
  if (!sb) return { ok: false as const, reason: 'no-supabase' }
  const { data, error } = await sb.rpc('user_like_listing', { p_listing_id: listingId })
  if (error) return { ok: false as const, reason: error.message }
  return { ok: true as const, data }
}

/** Owner create listing via public.create_listing(p_input json) -> { id } */
export async function rpcCreateListing(input: any) {
  const sb = await ensureSupabase()
  if (!sb) return { ok: false as const, reason: 'no-supabase' }
  const { data, error } = await sb.rpc('create_listing', { p_input: input })
  if (error) return { ok: false as const, reason: error.message }
  return { ok: true as const, data }
}
