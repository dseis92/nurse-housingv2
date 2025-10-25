import { useEffect } from 'react'
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion'

export type SwipeDirection = 'left' | 'right'
export type ListingCard = {
  id: string
  title: string
  weekly_price: number
  thumb_url?: string | null
  video_url?: string | null
  safety?: any
  notes?: string | null
}

type Props = {
  data: ListingCard
  index: number
  onSwiped: (id: string, dir: SwipeDirection) => void
  requestSwipe?: { id: string, dir: SwipeDirection } | null
}

export default function SwipeCard({ data, index, onSwiped, requestSwipe }: Props) {
  const controls = useAnimation()
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 0, 300], [-12, 0, 12])
  const opacity = useTransform(x, [-160, 0, 160], [0.3, 1, 0.3])

  // External trigger (button click) to fling the top card
  useEffect(() => {
    if (!requestSwipe || requestSwipe.id !== data.id) return
    const dir = requestSwipe.dir === 'right' ? 1 : -1
    void controls.start({
      x: dir * 800,
      rotate: dir * 25,
      opacity: 0,
      transition: { duration: 0.25 }
    }).then(() => onSwiped(data.id, requestSwipe.dir))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestSwipe?.id, requestSwipe?.dir])

  const handleDragEnd = (_: any, info: { offset: { x: number }, velocity: { x: number } }) => {
    const dx = info.offset.x
    const vx = info.velocity.x
    const power = Math.abs(dx) + Math.abs(vx) * 0.2
    const dir: SwipeDirection = dx > 0 ? 'right' : 'left'
    const pass = power > 300 && Math.abs(dx) > 120 // threshold
    if (pass) {
      void controls.start({
        x: dx > 0 ? 800 : -800,
        rotate: dx > 0 ? 25 : -25,
        opacity: 0,
        transition: { duration: 0.25 }
      }).then(() => onSwiped(data.id, dir))
    } else {
      void controls.start({ x: 0, rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } })
    }
  }

  return (
    <motion.div
      className="absolute inset-0 select-none"
      style={{ zIndex: 100 - index }}
      initial={{ scale: 1 - index * 0.03, y: index * 10, opacity: index === 0 ? 1 : 0.9 }}
      animate={{ scale: 1 - index * 0.03, y: index * 10, opacity: index === 0 ? 1 : 0.9 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        whileTap={{ scale: 0.98 }}
        onDragEnd={handleDragEnd}
        style={{ x, rotate, opacity }}
        animate={controls}
        className="h-full w-full"
      >
        <div className="h-full w-full rounded-3xl overflow-hidden shadow-lg bg-white border">
          {/* Media */}
          {data.video_url ? (
            <video
              className="w-full h-56 md:h-72 object-cover"
              src={data.video_url || undefined}
              muted
              playsInline
              controls={false}
              autoPlay
              loop
            />
          ) : (
            <img
              className="w-full h-56 md:h-72 object-cover"
              src={data.thumb_url || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop'}
              alt={data.title}
              draggable={false}
            />
          )}

          {/* Body */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{data.title}</h3>
                <p className="text-sm text-neutral-600">From ${data.weekly_price}/week</p>
              </div>
              <div className="text-right text-xs text-neutral-500">
                {data?.safety?.verified && (
                  <span className="inline-block rounded-full bg-emerald-50 text-emerald-700 px-2 py-1">
                    Verified
                  </span>
                )}
              </div>
            </div>
            {data.notes && <p className="mt-2 text-sm text-neutral-700 line-clamp-3">{data.notes}</p>}
          </div>
        </div>

        {/* Like/Nope ribbons */}
        <motion.div
          className="absolute top-4 left-4 px-3 py-1 rounded-xl border-2 border-red-500 text-red-600 font-bold"
          style={{ opacity: useTransform(x, [-240, -120], [1, 0]) }}
        >
          NOPE
        </motion.div>
        <motion.div
          className="absolute top-4 right-4 px-3 py-1 rounded-xl border-2 border-emerald-500 text-emerald-600 font-bold"
          style={{ opacity: useTransform(x, [120, 240], [0, 1]) }}
        >
          LIKE
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
