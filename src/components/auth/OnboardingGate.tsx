import { useEffect, useState } from 'react'
import { ensureSupabase } from '../../lib/supabaseClient'
import { useSession } from '../../stores/session'
import { useNavigate } from 'react-router-dom'

export default function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { session } = useSession()
  const nav = useNavigate()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    (async () => {
      const sb = await ensureSupabase()
      if (!sb || !session?.user?.id) { setChecked(true); return }
      const { data } = await sb.from('nurses_profiles').select('user_id').eq('user_id', session.user.id).maybeSingle()
      if (!data) nav('/onboarding', { replace: true })
      setChecked(true)
    })()
  }, [session?.user?.id])

  if (!checked) return null
  return <>{children}</>
}
