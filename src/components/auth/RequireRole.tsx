import { Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useSession, Role } from '../../stores/session'

export default function RequireRole({ roles, children }: { roles: Role[], children: JSX.Element }) {
  const { session, role, refresh, loading } = useSession()
  const loc = useLocation()

  useEffect(() => { refresh() }, [])

  if (loading) return <div className="p-6 text-center text-neutral-500">Loading…</div>
  if (!session) return <Navigate to="/login" replace state={{ from: loc }} />
  if (!role || !roles.includes(role)) return <Navigate to="/" replace />
  return children
}
