import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export let supabase: SupabaseClient | null = null
let initPromise: Promise<SupabaseClient | null> | null = null

function readInlineConfig(): { url: string; anon: string } | null {
  const g: any = (globalThis as any)
  const cfg = g?.__APP_CFG
  if (cfg && typeof cfg.url === 'string' && typeof cfg.anon === 'string' && cfg.url && cfg.anon) {
    return { url: cfg.url.replace(/\/$/, ''), anon: cfg.anon }
  }
  return null
}

async function loadPublicConfig(): Promise<{ url: string; anon: string } | null> {
  try {
    const candidates = ['/config.json', 'config.json']
    for (const u of candidates) {
      try {
        const r = await fetch(u, { cache: 'no-store' })
        if (!r.ok) continue
        const j = await r.json()
        const url = (j?.VITE_SUPABASE_URL || '').toString()
        const anon = (j?.VITE_SUPABASE_ANON_KEY || '').toString()
        if (url && anon) return { url: url.replace(/\/$/, ''), anon }
      } catch { /* try next */ }
    }
    return null
  } catch { return null }
}

export async function ensureSupabase(): Promise<SupabaseClient | null> {
  if (supabase) return supabase
  if (initPromise) {
    const c = await initPromise
    if (!c) initPromise = null
    return c
  }

  initPromise = (async () => {
    // 0) Inline config injected into index.html
    const inline = readInlineConfig()
    if (inline) {
      supabase = createClient(inline.url, inline.anon, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
      return supabase
    }

    // 1) Vite env (dev/build-time)
    const env: any = (import.meta as any)?.env || {}
    const envUrl = (env.VITE_SUPABASE_URL || '').toString()
    const envAnon = (env.VITE_SUPABASE_ANON_KEY || '').toString()
    if (envUrl && envAnon) {
      supabase = createClient(envUrl.replace(/\/$/, ''), envAnon, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
      return supabase
    }

    // 2) Runtime /config.json (prod fallback)
    const cfg = await loadPublicConfig()
    if (cfg) {
      supabase = createClient(cfg.url, cfg.anon, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
      return supabase
    }

    // 3) no keys
    return null
  })()

  const c = await initPromise
  if (!c) initPromise = null
  return c
}
