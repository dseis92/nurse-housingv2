import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null
let inited = false

async function loadPublicConfig(): Promise<{ url: string; anon: string } | null> {
  try {
    const r = await fetch('/config.json', { cache: 'no-store' })
    if (!r.ok) return null
    const j = await r.json()
    const url = j.VITE_SUPABASE_URL || ''
    const anon = j.VITE_SUPABASE_ANON_KEY || ''
    return (url && anon) ? { url, anon } : null
  } catch { return null }
}

export async function ensureSupabase(): Promise<SupabaseClient | null> {
  if (client) return client
  if (inited) return client
  inited = true

  // 1) If Vite injected values are present (dev or correctly configured prod), use them.
  const url = (import.meta as any)?.env?.VITE_SUPABASE_URL as string | undefined
  const anon = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as string | undefined
  if (url && anon) {
    client = createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
    return client
  }

  // 2) Otherwise, load from static public/config.json (committed or generated at build)
  const cfg = await loadPublicConfig()
  if (cfg) {
    client = createClient(cfg.url, cfg.anon, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
    return client
  }

  // 3) Give up (no keys)
  client = null
  return client
}
