import { useMemo, useState, useCallback } from 'react'
import SwipeCard, { type ListingCard, type SwipeDirection } from './SwipeCard'
import ListingModal from './ListingModal'
import { Heart, Star, X } from 'lucide-react'

function sample(count = 8): ListingCard[] {
  const base: ListingCard[] = [
    {
      id: 'l1',
      title: 'Secure Mission Bay Loft w/ Private Entry',
      city: 'San Francisco', region: 'CA', beds: 1, baths: 1,
      weekly_price: 1150,
      thumb_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop',
      video_url: '/videos/home-tour.mp4', // demo
      notes: 'Two-story loft with private keyed entry, secure parking, blackout shades and workspace.',
      amenities: ['Private Entry','Desk','Fast Wi-Fi','King Bed','In-Unit Laundry'],
      commuteText: '18 min peak • 12 min night',
      safetyScore: 92,
      petPolicy: 'All pets',
      scores: { fit: 95, commute: 82, safety: 97, quality: 89 }
    },
    {
      id: 'l2',
      title: 'Private In-Law w/ Smart Lock',
      city: 'Oakland', region: 'CA', beds: 1, baths: 1,
      weekly_price: 980,
      thumb_url: 'https://images.unsplash.com/photo-1505691723518-36a5ac3b2d9b?q=80&w=1600&auto=format&fit=crop',
      notes: 'Keypad entry, off-street parking and smoke detectors.',
      amenities: ['Keypad','Off-street','Smoke Detectors'],
      commuteText: '14 min peak • 10 min night',
      safetyScore: 88,
      petPolicy: 'Cats only',
      scores: { fit: 90, commute: 84, safety: 90, quality: 86 }
    },
    {
      id: 'l3',
      title: 'Quiet 1BR by Night-shift Route',
      city: 'Daly City', region: 'CA', beds: 1, baths: 1,
      weekly_price: 1025,
      thumb_url: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1600&auto=format&fit=crop',
      notes: 'No bridges, desk and in-unit washer/dryer.',
      amenities: ['No Bridges','Desk','Washer/Dryer'],
      commuteText: '16 min peak • 11 min night',
      safetyScore: 94,
      petPolicy: 'No pets',
      scores: { fit: 92, commute: 86, safety: 94, quality: 88 }
    }
  ]
  const arr: ListingCard[] = []
  while (arr.length < count) arr.push({ ...base[arr.length % base.length], id: `s${arr.length}` })
  return arr
}

export default function DeckLocal() {
  const initial = useMemo(() => sample(10), [])
  const [queue] = useState<ListingCard[]>(initial)
  const [top, setTop] = useState(0)
  const [requestSwipe, setRequestSwipe] = useState<{ id: string, dir: SwipeDirection } | null>(null)
  const [open, setOpen] = useState<{ show: boolean, item: ListingCard | null }>({ show: false, item: null })

  const visible = queue.slice(top, top + 3)

  const handleSwiped = useCallback((id: string) => {
    if (visible[0]?.id === id) setTop(t => Math.min(t + 1, queue.length))
    setRequestSwipe(null)
  }, [visible, queue.length])

  const act = (dir: SwipeDirection) => {
    const id = visible[0]?.id
    if (!id) return
    setRequestSwipe({ id, dir })
  }

  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="relative h-[760px] md:h-[820px]">
        {visible.length === 0 ? (
          <div className="absolute inset-0 grid place-items-center rounded-3xl border bg-white text-neutral-500">
            You’re all caught up — check back later 👋
          </div>
        ) : (
          visible.map((item, idx) => (
            <SwipeCard
              key={item.id}
              data={item}
              index={idx}
              onSwiped={handleSwiped}
              requestSwipe={requestSwipe}
              onOpenDetails={(i) => setOpen({ show: true, item: i })}
            />
          ))
        )}
      </div>

      {/* action bar */}
      <div className="mt-4 rounded-3xl border bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            Decision feedback shared instantly with owner
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => act('left')}
              className="inline-flex items-center gap-2 rounded-full border px-4 h-10 text-neutral-700 hover:bg-neutral-50 active:scale-95 transition"
              aria-label="Pass"
            >
              <X className="w-4 h-4" /> <span>Pass</span>
            </button>

            <button
              onClick={() => setOpen({ show: true, item: visible[0] ?? null })}
              className="inline-flex items-center gap-2 rounded-full border px-4 h-10 text-emerald-700 hover:bg-emerald-50 active:scale-95 transition"
              aria-label="Shortlist"
            >
              <Star className="w-4 h-4" /> <span>Shortlist</span>
            </button>

            <button
              onClick={() => act('right')}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white px-5 h-10 hover:bg-emerald-700 active:scale-95 transition"
              aria-label="Match"
            >
              <Heart className="w-4 h-4" /> <span>Match</span>
            </button>
          </div>
        </div>
      </div>

      {open.show && open.item && (
        <ListingModal
          open={open.show}
          listing={open.item}
          onClose={() => setOpen({ show: false, item: null })}
          onAction={(id, dir) => {
            setOpen({ show: false, item: null })
            setRequestSwipe({ id, dir })
          }}
        />
      )}
    </div>
  )
}
