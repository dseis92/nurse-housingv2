import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ensureSupabase } from '../../lib/supabaseClient'
import { useSession } from '../../stores/session'
import { getAuthRedirectURL } from '../../lib/authRedirect'

export default function LoginPage() {
  const { session, refresh } = useSession()
  const nav = useNavigate()
  const loc = useLocation()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { refresh() }, [])
  useEffect(() => {
    let alive = true
    ;(async () => {
      const sb = await ensureSupabase()
      if (alive) { setReady(!!sb); setLoading(false) }
    })()
    const t = setTimeout(() => { if (alive) setLoading(false) }, 2000)
    return () => { alive = false; clearTimeout(t) }
  }, [])

  useEffect(() => {
    if (session) {
      const to = (loc.state as any)?.from?.pathname || '/'
      nav(to, { replace: true })
    }
  }, [session])

  const sendMagic = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    const sb = await ensureSupabase()
    if (!sb) { setErr('Supabase config is missing. Check /config.json or .env.local'); return }
    try {
      await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: getAuthRedirectURL() }
      })
      setSent(true)
    } catch (e: any) {
      setErr(e?.message || 'Failed to send magic link')
    }
  }

  const signInWithGoogle = async () => {
    setErr(null)
    const sb = await ensureSupabase()
    if (!sb) { setErr('Supabase config is missing.'); return }
    try {
      await sb.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: getAuthRedirectURL() }
      })
    } catch (e: any) {
      setErr(e?.message || 'Google sign-in failed')
    }
  }

  return (
    <div className="max-w-md mx-auto card p-6">
      <h1 className="text-2xl font-bold mb-2">Sign in</h1>
      <p className="text-sm text-neutral-600 mb-4">Passwordless via email magic link.</p>

      {loading && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3 text-yellow-900 mb-3">
          Loading config…
        </div>
      )}

      {sent ? (
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-green-800">
          Magic link sent. Check your inbox to continue.
        </div>
      ) : (
        <form onSubmit={sendMagic} className="space-y-3">
          <input
            type="email"
            required
            className="w-full border rounded-xl px-3 py-2"
            placeholder="nurse@example.com"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            disabled={false}
            aria-busy={loading && !ready}
          >
            Send magic link
          </button>

          <div className="relative text-center my-2">
            <span className="px-2 text-xs text-neutral-500 bg-white relative z-10">or</span>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-neutral-200" />
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 font-medium hover:bg-neutral-50 active:bg-neutral-100 transition"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.24 1.4-1.63 4.1-5.4 4.1-3.25 0-5.9-2.7-5.9-6s2.65-6 5.9-6c1.85 0 3.1.78 3.8 1.45l2.6-2.5C16.9 3 14.65 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c6.6 0 8.2-4.6 7.9-7V10.2H12z"/>
            </svg>
            Continue with Google
          </button>
        </form>
      )}

      {err && <div className="mt-3 text-sm text-red-600">{err}</div>}

      {!ready && !loading && (
        <div className="mt-3 text-xs text-neutral-500">
          Tip: App couldn’t auto-load Supabase at startup. Clicking a button will try again.
        </div>
      )}
    </div>
  )
}
