import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ensureSupabase } from '../../lib/supabaseClient'
import { useSession } from '../../stores/session'

export default function AuthCallback() {
  const nav = useNavigate()
  const { refresh } = useSession()
  const [msg, setMsg] = useState('Finalizing sign-in…')

  useEffect(() => {
    let alive = true
    ;(async () => {
      const sb = await ensureSupabase()
      if (!sb) { setMsg('Missing Supabase config.'); return }

      try {
        await sb.auth.exchangeCodeForSession(window.location.href).catch(() => null)
        await refresh()
        const { data } = await sb.auth.getSession()
        const uid = data?.session?.user?.id
        if (!alive) return
        if (!uid) { setMsg('No active session. Redirecting…'); setTimeout(()=>nav('/login', { replace: true }), 600); return }
        nav('/', { replace: true })
      } catch (e:any) {
        setMsg(e?.message || 'Auth callback failed.'); setTimeout(()=>nav('/login', { replace: true }), 1000)
      }
    })()
    return () => { alive = false }
  }, [])
  return <div className="max-w-md mx-auto card p-6 text-sm text-neutral-600">{msg}</div>
}
