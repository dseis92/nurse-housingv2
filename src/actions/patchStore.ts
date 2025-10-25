import { hasSupabaseEnv } from '../lib/supabaseClient'
import { likeListing as rpcLike, passListing as rpcPass, createListing as rpcCreate } from './supabaseActions'

export async function patchStoreWithSupabase() {
  if (!hasSupabaseEnv) return
  const mod = await import('../stores/useAppStore')
  const useAppStore = (mod as any).useAppStore
  if (!useAppStore?.getState) return

  const s = useAppStore.getState()
  const next: Record<string, any> = {}

  if (typeof s.likeListing === 'function') {
    next.likeListing = async (listingId: string) => {
      try { return await rpcLike(listingId) } catch { return await s.likeListing(listingId) }
    }
  }
  if (typeof s.passListing === 'function') {
    next.passListing = async (listingId: string) => {
      try { await rpcPass(listingId) } catch { await s.passListing(listingId) }
    }
  }
  if (typeof s.createListing === 'function') {
    next.createListing = async (input: any) => {
      try { return await rpcCreate(input) } catch { return await s.createListing(input) }
    }
  }

  if (Object.keys(next).length) useAppStore.setState(next, false)
}
