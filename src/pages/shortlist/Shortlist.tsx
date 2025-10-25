import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useSession } from '../../stores/session'

export default function Shortlist() {
  const { session } = useSession()
  const [rows, setRows] = useState<any[]>([])
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(()=>{ (async ()=>{
    if (!session) return
    const { data } = await supabase.from('matches_view').select('*').eq('nurse_user_id', session.user.id).limit(20)
    setRows(data ?? [])
  })()}, [session?.user?.id])

  const softHold = async (matchId: string) => {
    setBusy(matchId)
    try {
      const r = await fetch('/api/holds/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, amountCents: 2000 })
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'Failed to create hold')
      alert(`Soft hold created. ${j.client_secret ? 'Payment intent ready.' : 'No Stripe key set (dev mode).'}`)
    } catch (e:any) {
      alert(e?.message || 'Soft hold failed')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-3">Shortlist</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {rows.map(r=>(
          <div key={r.id} className="card p-4">
            <div className="font-semibold mb-1">{r.title}</div>
            <div className="text-sm text-neutral-600 mb-3">${r.weekly_price}/wk • match score ~{Math.round(r.score ?? 70)}</div>
            <div className="flex gap-2">
              <a className="btn btn-primary" href={`/chat/${r.id}`}>Open chat</a>
              <button
                className="btn"
                onClick={()=>softHold(r.id)}
                disabled={busy===r.id}
              >
                {busy===r.id ? 'Holding…' : 'Soft hold'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
