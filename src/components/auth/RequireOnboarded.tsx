import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { fetchNurseOnboarding } from '../../actions/onboardingActions'

/**
 * RequireOnboarded:
 * - Allows access to /onboarding always (so users can fill it out).
 * - For all other routes, checks server onboarding answers.
 * - If none, redirects to /onboarding.
 * - If Supabase env is missing or the RPC fails, it fails open (renders children)
 *   to avoid blocking local demos.
 */
export default function RequireOnboarded({ children }: { children: JSX.Element }) {
  const location = useLocation()
  const [ready, setReady] = useState(false)
  const [needsRedirect, setNeedsRedirect] = useState(false)

  const isOnboardingRoute = location.pathname.startsWith('/onboarding')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // Skip check on onboarding route
        if (isOnboardingRoute) {
          if (mounted) setReady(true)
          return
        }
        const answers = await fetchNurseOnboarding()
        const empty = !answers || (typeof answers === 'object' && Object.keys(answers).length === 0)
        if (mounted) {
          setNeedsRedirect(empty)
          setReady(true)
        }
      } catch {
        // Fail open if env/RPC not available
        if (mounted) setReady(true)
      }
    })()
    return () => { mounted = false }
  }, [isOnboardingRoute])

  if (!ready) return null
  if (needsRedirect) {
    return <Navigate to="/onboarding" replace state={{ from: location }} />
  }
  return children
}
