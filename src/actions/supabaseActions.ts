import { ensureSupabase } from '../lib/supabaseClient'

export type Listing = {
  id: string
  title: string
  weekly_price: number
  owner_id: string
  thumb_url?: string | null
  video_url?: string | null
  safety?: any
}

export async function syncFromSupabase(userId?: string) {
  const sb = await ensureSupabase()
  if (!sb) return { listings: [], matches: [], contracts: [] }

  let listings: Listing[] = []
  try {
    const { data, error } = await sb.rpc('get_feed', { p_user_id: userId ?? null })
    if (!error && Array.isArray(data)) listings = data as Listing[]
  } catch { /* noop */ }

  if (listings.length === 0) {
    const { data } = await sb.from('listings_view').select('*').limit(50)
    listings = (data as any[] ?? []) as Listing[]
  }

  const { data: matches = [] } = await sb.from('matches_view').select('*').limit(50)
  const { data: contracts = [] } = userId
    ? await sb.from('contracts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1)
    : { data: [] as any[] }

  return { listings, matches, contracts }
}

export async function likeListing(listingId: string) {
  const sb = await ensureSupabase()
  if (!sb) return { match_id: null }
  try {
    const { data, error } = await sb.rpc('user_like_listing', { p_listing_id: listingId })
    if (!error) return data ?? { match_id: null }
  } catch { /* noop */ }
  await sb.from('likes').insert({ listing_id: listingId, direction: 'like' })
  const { data } = await sb.rpc('ensure_match_on_mutual_like', { p_listing_id: listingId })
  return data ?? { match_id: null }
}

export async function passListing(listingId: string) {
  const sb = await ensureSupabase()
  if (!sb) return
  try { await sb.from('likes').insert({ listing_id: listingId, direction: 'pass' }) } catch {}
}

export async function createListing(input: {
  title: string
  weekly_price: number
  min_stay_weeks?: number
  pet_rules?: any
  safety?: any
  description?: string
  thumb_url?: string | null
  video_url?: string | null
}) {
  const sb = await ensureSupabase()
  if (!sb) return { id: null }
  try {
    const { data, error } = await sb.rpc('create_listing', { p_input: input })
    if (!error && data?.id) return data
  } catch {}
  const { data, error } = await sb.from('listings').insert(input).select('id').single()
  if (error) throw error
  return data
}
