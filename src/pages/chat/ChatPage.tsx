import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ensureSupabase } from '../../lib/supabaseClient'

type Msg = { id: string; sender_id: string; content: string; created_at: string }

export default function ChatPage() {
  const { matchId } = useParams()
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let unsub: any
    ;(async () => {
      const sb = await ensureSupabase()
      if (!sb || !matchId) return
      const { data } = await sb.from('messages').select('*').eq('match_id', matchId).order('created_at', { ascending: true })
      setMsgs((data as Msg[]) ?? [])
      const ch = sb
        .channel(`messages:${matchId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
          (payload: any) => setMsgs((s) => [...s, payload.new]))
        .subscribe()
      unsub = () => { sb.removeChannel(ch) }
    })()
    return () => { if (unsub) unsub() }
  }, [matchId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs.length])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const sb = await ensureSupabase()
    if (!sb || !matchId || !text.trim()) return
    await sb.from('messages').insert({ match_id: matchId, content: text.trim() })
    setText('')
  }

  return (
    <div className="max-w-2xl mx-auto card p-4">
      <h1 className="text-xl font-bold mb-3">Chat</h1>
      <div className="h-80 overflow-auto border rounded-xl p-3">
        {msgs.map((m) => (<div key={m.id} className="mb-2"><div className="inline-block bg-neutral-100 px-3 py-2 rounded-2xl">{m.content}</div></div>))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex gap-2 mt-3">
        <input className="flex-1 border rounded-xl px-3 py-2" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" />
        <button className="btn btn-primary">Send</button>
      </form>
    </div>
  )
}
