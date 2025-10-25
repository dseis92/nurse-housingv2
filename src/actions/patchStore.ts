import { hasSupabaseEnv } from '../lib/supabaseClient'
import { likeListing as rpcLike, passListing as rpcPass, createListing as rpcCreate } from './supabaseActions'

// lazy import to avoid circulars
function getStore() {
  return require('../stores/useAppStore')?.useAppStore
}

export function patchStoreWithSupabase() {
  if (!hasSupabaseEnv) return
  const useAppStore = getStore()
  if (!useAppStore?.getState) return

  const s = useAppStore.getState()
  const next: Record<string, any> = {}

  if (typeof s.likeListing === 'function') {
    next.likeListing = async (listingId: string) => {
      try {
        const res = await rpcLike(listingId)
        return res
      } catch (e) {
        // fallback to original
        return await s.likeListing(listingId)
      }
    }
  }
  if (typeof s.passListing === 'function') {
    next.passListing = async (listingId: string) => {
      try {
        await rpcPass(listingId)
      } catch {
        await s.passListing(listingId)
      }
    }
  }
  if (typeof s.createListing === 'function') {
    next.createListing = async (input: any) => {
      try {
        const res = await rpcCreate(input)
        return res
      } catch (e) {
        return await s.createListing(input)
      }
    }
  }

  if (Object.keys(next).length) {
    useAppStore.setState(next, false)
  }
}
