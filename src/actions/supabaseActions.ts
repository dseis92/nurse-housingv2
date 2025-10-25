import { supabase, hasSupabaseEnv } from '../lib/supabaseClient'

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
  if (!hasSupabaseEnv) return { listings: [], matches: [], contracts: [] }

  // listings feed (use view or RPC if available)
  let listings: Listing[] = []
  // prefer RPC get_feed if present
  try {
    const { data, error } = await supabase.rpc('get_feed', { p_user_id: userId ?? null })
    if (!error && Array.isArray(data)) listings = data as Listing[]
  } catch { /* ignore */ }
  if (listings.length === 0) {
    const { data } = await supabase.from('listings_view').select('*').limit(50)
    listings = (data as any[] ?? []) as Listing[]
  }

  // matches
  const { data: matches = [] } = await supabase.from('matches_view').select('*').limit(50)
  // contracts (latest for user)
  const { data: contracts = [] } = userId
    ? await supabase.from('contracts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1)
    : { data: [] as any[] }

  return { listings, matches, contracts }
}

export async function likeListing(listingId: string) {
  if (!hasSupabaseEnv) return { match_id: null }
  // prefer RPC user_like_listing (creates like + returns match if mutual)
  try {
    const { data, error } = await supabase.rpc('user_like_listing', { p_listing_id: listingId })
    if (!error) return data ?? { match_id: null }
  } catch { /* fall through */ }

  // fallback: insert into likes then attempt ensure_match_on_mutual_like
  await supabase.from('likes').insert({ listing_id: listingId, direction: 'like' })
  const { data } = await supabase.rpc('ensure_match_on_mutual_like', { p_listing_id: listingId })
  return data ?? { match_id: null }
}

export async function passListing(listingId: string) {
  if (!hasSupabaseEnv) return
  try {
    await supabase.from('likes').insert({ listing_id: listingId, direction: 'pass' })
  } catch {/* ignore */}
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
  if (!hasSupabaseEnv) return { id: null }

  // prefer RPC create_listing
  try {
    const { data, error } = await supabase.rpc('create_listing', { p_input: input })
    if (!error && data?.id) return data
  } catch { /* ignore */ }

  const { data, error } = await supabase.from('listings').insert(input).select('id').single()
  if (error) throw error
  return data
}
