import { Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useSession } from '../../stores/session'

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { session, refresh, loading } = useSession()
  const loc = useLocation()

  useEffect(() => { refresh() }, [])

  if (loading) return <div className="p-6 text-center text-neutral-500">Loading…</div>
  if (!session) return <Navigate to="/login" replace state={{ from: loc }} />
  return children
}
