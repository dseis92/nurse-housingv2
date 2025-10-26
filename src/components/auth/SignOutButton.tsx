import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ensureSupabase } from '../../lib/supabaseClient'
import { useSession } from '../../stores/session'

export default function SignOutButton({ className = 'menu-item menu-item-danger', label = 'Sign out' }:{
  className?: string; label?: string
}) {
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()
  const { refresh } = useSession()

  const click = async () => {
    if (busy) return
    setBusy(true)
    try {
      localStorage.removeItem('DEV_GUEST')
      const sb = await ensureSupabase()
      await sb?.auth.signOut().catch(()=>{})
      await refresh()
      nav('/login', { replace: true })
    } finally {
      setBusy(false)
    }
  }
  return (
    <button type="button" onClick={click} className={`btn ${className}`} aria-busy={busy}>
      {busy ? 'Signing out…' : label}
    </button>
  )
}
