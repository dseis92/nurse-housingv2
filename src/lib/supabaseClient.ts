import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let url  = (import.meta as any)?.env?.VITE_SUPABASE_URL as string | undefined
let anon = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as string | undefined

export let hasSupabaseEnv = Boolean(url && anon)
export let supabase: SupabaseClient | null = hasSupabaseEnv
  ? createClient(url!, anon!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null

let initPromise: Promise<void> | null = null

export async function ensureSupabase(): Promise<SupabaseClient | null> {
  if (supabase) return supabase
  if (!initPromise) {
    initPromise = (async () => {
      try {
        const r = await fetch('/api/public-env', { cache: 'no-store' })
        if (!r.ok) return
        const j = await r.json()
        url = j.VITE_SUPABASE_URL || j.SUPABASE_URL
        anon = j.VITE_SUPABASE_ANON_KEY
        if (url && anon) {
          supabase = createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
          hasSupabaseEnv = true
        }
      } catch { /* noop */ }
    })()
  }
  await initPromise
  return supabase
}
