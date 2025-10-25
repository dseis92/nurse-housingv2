import { useCallback, useMemo, useState } from 'react'
import SwipeCard, { type ListingCard, type SwipeDirection } from './SwipeCard'
import { Heart, X } from 'lucide-react'

type Props = {
  cards: ListingCard[]
  onVote?: (id: string, dir: SwipeDirection) => Promise<void> | void
}

export default function SwipeDeck({ cards, onVote }: Props) {
  const [queue, setQueue] = useState(cards)
  const top = queue[0]
  const [requestSwipe, setRequestSwipe] = useState<{ id: string, dir: SwipeDirection } | null>(null)

  const handleSwiped = useCallback(async (id: string, dir: SwipeDirection) => {
    setRequestSwipe(null)
    setQueue(q => q.filter(c => c.id !== id))
    try { await onVote?.(id, dir) } catch { /* noop */ }
  }, [onVote])

  const stacked = useMemo(() => queue.slice(0, 3), [queue])

  const buttonSwipe = (dir: SwipeDirection) => {
    if (!top) return
    setRequestSwipe({ id: top.id, dir })
  }

  if (queue.length === 0) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="rounded-3xl border p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">You’re all caught up 🎉</h3>
          <p className="text-neutral-600">Check back later for new places or adjust your filters.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Card stage */}
      <div className="relative h-[540px] md:h-[620px]">
        {stacked.map((c, i) => (
          <SwipeCard
            key={c.id}
            data={c}
            index={i}
            onSwiped={handleSwiped}
            requestSwipe={requestSwipe}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-center gap-6">
        <button
          onClick={()=>buttonSwipe('left')}
          className="inline-flex items-center justify-center w-14 h-14 rounded-full border bg-white hover:bg-neutral-50 active:bg-neutral-100 shadow"
          aria-label="Pass"
        >
          <X className="w-6 h-6 text-red-500" />
        </button>
        <button
          onClick={()=>buttonSwipe('right')}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-md"
          aria-label="Like"
        >
          <Heart className="w-7 h-7" />
        </button>
      </div>
    </div>
  )
}
