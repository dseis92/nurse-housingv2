import { createPortal } from 'react-dom'
import { X, Heart, Shield, Dog, Lock, CarFront } from 'lucide-react'
import type { ListingCard, SwipeDirection } from './SwipeCard'

type Props = {
  open: boolean
  listing: ListingCard | null
  onClose: () => void
  onAction: (id: string, dir: SwipeDirection) => void
}

export default function ListingModal({ open, listing, onClose, onAction }: Props) {
  if (!open || !listing) return null
  const L = listing

  const media = L.video_url ? (
    <video
      className="w-full h-64 md:h-80 object-cover rounded-2xl"
      src={L.video_url || undefined}
      muted playsInline autoPlay loop controls={false}
    />
  ) : (
    <img
      className="w-full h-64 md:h-80 object-cover rounded-2xl"
      src={L.thumb_url || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop'}
      alt={L.title}
      draggable={false}
    />
  )

  return createPortal(
    <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-3"
         role="dialog" aria-modal="true" onClick={onClose}>
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border p-3 md:p-4"
           onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold">{L.title}</h3>
            <p className="text-neutral-600 text-sm">From ${L.weekly_price}/week</p>
          </div>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close"><X className="w-5 h-5" /></button>
        </div>

        <div className="mt-3">{media}</div>

        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Highlights</h4>
            <ul className="text-sm text-neutral-700 list-disc list-inside space-y-1">
              {L.notes && <li>{L.notes}</li>}
              <li>Commute est.: ~15–20 min at peak (placeholder)</li>
              <li>Min stay: 4+ weeks (placeholder)</li>
              <li>Owner response: typically &lt; 1hr (placeholder)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Safety & Rules</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
                <Shield className="w-4 h-4"/> {L?.safety?.verified ? 'Verified host' : 'Unverified host'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
                <Lock className="w-4 h-4"/> Internal locks
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
                <CarFront className="w-4 h-4"/> Safe parking
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
                <Dog className="w-4 h-4"/> Pet rules: see listing
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button className="btn btn-outline w-24" onClick={()=>onAction(L.id, 'left')} aria-label="Pass">Pass</button>
          <div className="flex-1" />
          <button className="btn btn-primary w-28 inline-flex items-center justify-center gap-2"
                  onClick={()=>onAction(L.id, 'right')} aria-label="Like">
            <Heart className="w-5 h-5"/> Like
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
