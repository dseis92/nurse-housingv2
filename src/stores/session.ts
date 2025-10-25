import { create } from 'zustand'
import { supabase, hasSupabaseEnv } from '../lib/supabaseClient'

export type Role = 'nurse' | 'owner' | 'admin' | null

type State = {
  loading: boolean
  session: import('@supabase/supabase-js').Session | null
  role: Role
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

export const useSession = create<State>((set, get) => ({
  loading: false,
  session: null,
  role: null,
  refresh: async () => {
    if (!hasSupabaseEnv) return
    set({ loading: true })
    const { data: { session } } = await supabase.auth.getSession()
    let role: Role = null
    if (session?.user) {
      const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
      role = (data?.role ?? null) as Role
    }
    set({ session: session ?? null, role, loading: false })
    // subscribe once
    const unsub = (supabase as any)._sessionSubscriptionSet ? null : supabase.auth.onAuthStateChange(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      let role: Role = null
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
        role = (data?.role ?? null) as Role
      }
      set({ session: session ?? null, role })
    })
    ;(supabase as any)._sessionSubscriptionSet = true
  },
  signOut: async () => {
    if (!hasSupabaseEnv) return
    await supabase.auth.signOut()
    set({ session: null, role: null })
  }
}))
