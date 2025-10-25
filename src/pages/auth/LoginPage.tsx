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
  const [loading, setLoading] = useState(true)

  useEffect(() => { refresh() }, [])
  // Try to pre-initialize Supabase, but don't block UI if it takes too long
  useEffect(() => {
    let alive = true
    ;(async () => {
      const sb = await ensureSupabase()
      if (alive) {
        setReady(!!sb)
        setLoading(false)
      }
    })()
    // fallback: even if ensureSupabase() returns null, stop showing loader after 2s
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
    if (!sb) {
      setErr('Supabase config is missing. Check /config.json or Vercel env.')
      return
    }
    try {
      await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin }
      })
      setSent(true)
    } catch (e: any) {
      setErr(e?.message || 'Failed to send magic link')
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
            // keep enabled even when not ready; we guard in handler
            disabled={false}
            aria-busy={loading && !ready}
          >
            Send magic link
          </button>
        </form>
      )}

      {err && <div className="mt-3 text-sm text-red-600">{err}</div>}

      {!ready && !loading && (
        <div className="mt-3 text-xs text-neutral-500">
          Tip: App couldn’t auto-load Supabase at startup. Clicking “Send magic link” will try again.
        </div>
      )}
    </div>
  )
}
