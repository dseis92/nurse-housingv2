import { useCallback, useMemo, useState } from 'react'
import SwipeCard, { type ListingCard, type SwipeDirection } from './SwipeCard'
import { Heart, X, Info } from 'lucide-react'
import ListingModal from './ListingModal'

type Props = {
  cards: ListingCard[]
  onVote?: (id: string, dir: SwipeDirection) => Promise<void> | void
}

export default function SwipeDeck({ cards, onVote }: Props) {
  const [queue, setQueue] = useState(cards)
  const [requestSwipe, setRequestSwipe] = useState<{ id: string, dir: SwipeDirection } | null>(null)
  const [selected, setSelected] = useState<ListingCard | null>(null)

  const top = queue[0]
  const stacked = useMemo(() => queue.slice(0, 3), [queue])

  const handleSwiped = useCallback(async (id: string, dir: SwipeDirection) => {
    setRequestSwipe(null)
    setQueue(q => q.filter(c => c.id !== id))
    try { await onVote?.(id, dir) } catch { /* noop */ }
  }, [onVote])

  const buttonSwipe = (dir: SwipeDirection) => {
    if (!top) return
    setRequestSwipe({ id: top.id, dir })
  }

  const openDetails = (item: ListingCard) => setSelected(item)
  const closeDetails = () => setSelected(null)

  const modalAction = async (id: string, dir: SwipeDirection) => {
    // remove from queue then delegate
    setQueue(q => q.filter(c => c.id !== id))
    try { await onVote?.(id, dir) } catch {}
    setSelected(null)
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
      <div className="relative h-[540px] md:h-[620px]">
        {stacked.map((c, i) => (
          <SwipeCard
            key={c.id}
            data={c}
            index={i}
            onSwiped={handleSwiped}
            requestSwipe={requestSwipe}
            onOpenDetails={openDetails}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-6">
        <button
          onClick={()=>buttonSwipe('left')}
          className="btn btn-outline w-14 h-14 rounded-full"
          aria-label="Pass"
        ><X className="w-6 h-6 text-red-500" /></button>

        <button
          onClick={()=>openDetails(top!)}
          className="btn btn-ghost w-12 h-12 rounded-full"
          aria-label="Details"
          title="View details"
        ><Info className="w-5 h-5" /></button>

        <button
          onClick={()=>buttonSwipe('right')}
          className="btn btn-primary w-16 h-16 rounded-full"
          aria-label="Like"
        ><Heart className="w-7 h-7" /></button>
      </div>

      <ListingModal
        open={!!selected}
        listing={selected}
        onClose={closeDetails}
        onAction={modalAction}
      />
    </div>
  )
}
