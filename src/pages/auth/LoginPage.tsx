import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ensureSupabase } from '../../lib/supabaseClient'
import { useSession } from '../../stores/session'
import { getDevCallback, getProdCallback } from '../../lib/redirects'

type Mode = 'dev' | 'prod'

export default function LoginPage() {
  const { session, refresh } = useSession()
  const nav = useNavigate()
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [mode, setMode] = useState<Mode>('dev')

  useEffect(() => { refresh() }, [])
  useEffect(() => {
    let alive = true
    ;(async () => {
      const sb = await ensureSupabase()
      if (alive) { setReady(!!sb); setLoading(false) }
    })()
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (session) nav('/', { replace: true })
  }, [session])

  const callbackURL = mode === 'prod' ? getProdCallback() : getDevCallback()

  const signInWithGoogle = async () => {
    setErr(null)
    const sb = await ensureSupabase()
    if (!sb) { setErr('Supabase not configured'); return }
    try {
      await sb.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: callbackURL }
      })
    } catch (e:any) {
      setErr(e?.message || 'Google sign-in failed')
    }
  }

  const continueAsGuest = () => {
    localStorage.setItem('DEV_GUEST', '1')
    nav('/onboarding', { replace: true })
  }

  return (
    <div className="max-w-md mx-auto card p-6">
      <h1 className="text-2xl font-bold mb-2">Sign in</h1>
      <p className="text-sm text-neutral-600 mb-4">Email login is disabled. Use Google or Dev Guest.</p>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={()=>setMode('dev')}
                className={`btn ${mode==='dev'?'btn-primary':'btn-outline'}`}>This device (dev)</button>
        <button type="button" onClick={()=>setMode('prod')}
                className={`btn ${mode==='prod'?'btn-primary':'btn-outline'}`}>Production</button>
      </div>
      <div className="text-xs text-neutral-500 mb-4 break-all">
        OAuth redirect: <code>{callbackURL}</code>
      </div>

      <div className="space-y-3">
        <button type="button" onClick={signInWithGoogle}
                className="btn btn-outline w-full" aria-busy={loading && !ready}>
          Continue with Google
        </button>

        <button type="button" onClick={continueAsGuest}
                className="btn btn-primary w-full">
          Continue as Dev Guest
        </button>
      </div>

      {err && <div className="mt-3 text-sm text-red-600">{err}</div>}
    </div>
  )
}
