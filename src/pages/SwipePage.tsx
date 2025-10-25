import { useEffect, useState } from 'react'
import SwipeDeck from '../components/swipe/SwipeDeck'
import type { ListingCard, SwipeDirection } from '../components/swipe/SwipeCard'
import { likeListing, passListing, syncFromSupabase } from '../actions/supabaseActions'

const DEMO: ListingCard[] = [
  {
    id: 'demo-1',
    title: 'Quiet studio near Mercy Hospital',
    weekly_price: 620,
    thumb_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop',
    notes: 'Private entrance • off-street parking • 12 min commute at 7pm shift'
  },
  {
    id: 'demo-2',
    title: 'Pet-friendly 1BR w/ secure entry',
    weekly_price: 680,
    thumb_url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop',
    notes: 'Cats/dogs ok • smart lock • walkable block'
  },
  {
    id: 'demo-3',
    title: 'Furnished carriage house',
    weekly_price: 740,
    thumb_url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=1200&auto=format&fit=crop',
    notes: 'Driveway parking • safe lighting • 15 min at peak'
  }
]

export default function SwipePage() {
  const [cards, setCards] = useState<ListingCard[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [source, setSource] = useState<'supabase'|'demo'>('demo')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { listings } = await syncFromSupabase()
        if (!alive) return
        if (Array.isArray(listings) && listings.length > 0) {
          const mapped = listings.map((l: any) => ({
            id: String(l.id),
            title: l.title ?? 'Furnished studio',
            weekly_price: Number(l.weekly_price ?? 650),
            thumb_url: l.thumb_url ?? l.image_url ?? null,
            video_url: l.video_url ?? null,
            safety: l.safety ?? {},
            notes: l.description ?? null,
          })) as ListingCard[]
          setCards(mapped)
          setSource('supabase')
        } else {
          setCards([...DEMO])
          setSource('demo')
        }
      } catch {
        setCards([...DEMO])
        setSource('demo')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  const onVote = async (id: string, dir: SwipeDirection) => {
    if (busy) return
    setBusy(true)
    try {
      if (dir === 'right') {
        await likeListing(id)
      } else {
        await passListing(id)
      }
    } catch {
      // ignore in MVP
    } finally {
      setBusy(false)
    }
  }

  const resetDemo = () => {
    setCards([...DEMO])
    setSource('demo')
  }

  const reloadFromServer = async () => {
    setLoading(true)
    try {
      const { listings } = await syncFromSupabase()
      if (Array.isArray(listings) && listings.length > 0) {
        const mapped = listings.map((l: any) => ({
          id: String(l.id),
          title: l.title ?? 'Furnished studio',
          weekly_price: Number(l.weekly_price ?? 650),
          thumb_url: l.thumb_url ?? l.image_url ?? null,
          video_url: l.video_url ?? null,
          safety: l.safety ?? {},
          notes: l.description ?? null,
        })) as ListingCard[]
        setCards(mapped)
        setSource('supabase')
      } else {
        setCards([...DEMO])
        setSource('demo')
      }
    } catch {
      setCards([...DEMO])
      setSource('demo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Swipe</h1>
          <p className="text-neutral-600 text-sm">
            Fast yes/no to build your shortlist
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full border">{source}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={resetDemo}>Reset demo</button>
          <button className="btn btn-primary" onClick={reloadFromServer}>Reload</button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border p-8 text-center">Loading…</div>
      ) : (
        <SwipeDeck cards={cards} onVote={onVote} />
      )}
    </div>
  )
}
