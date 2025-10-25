import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ensureSupabase } from '../../lib/supabaseClient'
import { useSession } from '../../stores/session'

export default function LoginPage() {
  const { session, refresh } = useSession()
  const nav = useNavigate()
  const loc = useLocation()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => { refresh() }, [])
  useEffect(() => { (async()=>{ const sb = await ensureSupabase(); setReady(!!sb) })() }, [])

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
    if (!sb) { setErr('Supabase env not configured.'); return }
    try {
      await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
      setSent(true)
    } catch (e: any) {
      setErr(e?.message || 'Failed to send magic link')
    }
  }

  return (
    <div className="max-w-md mx-auto card p-6">
      <h1 className="text-2xl font-bold mb-2">Sign in</h1>
      <p className="text-sm text-neutral-600 mb-4">Passwordless via email magic link.</p>

      {!ready && <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3 text-yellow-900 mb-3">Loading config…</div>}

      {sent ? (
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-green-800">
          Magic link sent. Check your inbox to continue.
        </div>
      ) : (
        <form onSubmit={sendMagic} className="space-y-3">
          <input
            type="email" required value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full border rounded-xl px-3 py-2" placeholder="nurse@example.com"
          />
          <button className="btn btn-primary w-full" disabled={!ready}>Send magic link</button>
        </form>
      )}

      {err && <div className="mt-3 text-sm text-red-600">{err}</div>}
    </div>
  )
}
