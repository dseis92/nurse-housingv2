import { ReactNode, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../../stores/session'
import { ensureSupabase } from '../../lib/supabaseClient'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const devGuest = typeof window !== 'undefined' && localStorage.getItem('DEV_GUEST') === '1'
  const { session, refresh } = useSession()
  const [ready, setReady] = useState(false)
  const loc = useLocation()

  useEffect(() => {
    if (devGuest) { setReady(true); return }
    let alive = true
    ;(async () => {
      await ensureSupabase().catch(() => null)
      await refresh()
      if (alive) setReady(true)
    })()
    return () => { alive = false }
  }, [devGuest])

  if (!ready) return <div className="p-6">Loading…</div>
  if (devGuest) return <>{children}</>
  if (!session) return <Navigate to="/login" replace state={{ from: loc }} />
  return <>{children}</>
}
