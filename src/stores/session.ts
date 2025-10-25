import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { ensureSupabase } from '../lib/supabaseClient'

export type Role = 'nurse' | 'owner' | 'admin' | null

type State = {
  loading: boolean
  session: Session | null
  role: Role
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

export const useSession = create<State>((set) => ({
  loading: false,
  session: null,
  role: null,
  refresh: async () => {
    const sb = await ensureSupabase()
    if (!sb) return
    set({ loading: true })
    const { data: { session } } = await sb.auth.getSession()
    let role: Role = null
    if (session?.user) {
      const { data } = await sb.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
      role = (data?.role ?? null) as Role
    }
    set({ session: session ?? null, role, loading: false })
    // subscribe once per page-load
    const anySB = sb as any
    if (!anySB._sessionSubscriptionSet) {
      sb.auth.onAuthStateChange(async () => {
        const { data: { session } } = await sb.auth.getSession()
        let role: Role = null
        if (session?.user) {
          const { data } = await sb.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
          role = (data?.role ?? null) as Role
        }
        set({ session: session ?? null, role })
      })
      anySB._sessionSubscriptionSet = true
    }
  },
  signOut: async () => {
    const sb = await ensureSupabase()
    if (!sb) return
    await sb.auth.signOut()
    set({ session: null, role: null })
  }
}))
