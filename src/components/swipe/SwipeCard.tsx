import { useEffect, useRef } from 'react'
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion'
import { CarFront, Gauge, Dog, CheckCircle2, Film } from 'lucide-react'

export type SwipeDirection = 'left' | 'right'
export type ListingCard = {
  id: string
  title: string
  weekly_price: number
  thumb_url?: string | null
  video_url?: string | null
  notes?: string | null
  amenities?: string[]
  commuteText?: string
  safetyScore?: number
  petPolicy?: string
  scores?: { fit: number; commute: number; safety: number; quality: number }
  safety?: { verified?: boolean }
  city?: string
  region?: string
  beds?: number
  baths?: number
}

type Props = {
  data: ListingCard
  index: number
  onSwiped: (id: string, dir: SwipeDirection) => void
  requestSwipe?: { id: string, dir: SwipeDirection } | null
  onOpenDetails?: (item: ListingCard) => void
}

const FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop"

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs text-slate-700 shadow-sm">{children}</span>
}

function StatRow({ label, score }: { label: string; score?: number }) {
  return (
    <div className="w-full rounded-full bg-slate-100">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="text-sm text-slate-600">{label}</div>
        {typeof score === 'number' && (
          <div className="flex items-center gap-1 text-slate-700">
            <span className="text-sm font-medium">{score}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SwipeCard({ data, index, onSwiped, requestSwipe, onOpenDetails }: Props) {
  const controls = useAnimation()
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 0, 300], [-10, 0, 10])
  const opacity = useTransform(x, [-160, 0, 160], [0.35, 1, 0.35])

  const downX = useRef(0)
  const moved = useRef(false)

  useEffect(() => {
    if (!requestSwipe || requestSwipe.id !== data.id) return
    const dir = requestSwipe.dir === 'right' ? 1 : -1
    void controls.start({ x: dir * 900, rotate: dir * 22, opacity: 0, transition: { duration: 0.24 } })
      .then(() => onSwiped(data.id, requestSwipe.dir))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestSwipe?.id, requestSwipe?.dir])

  const handleDragEnd = (_: any, info: { offset: { x: number }, velocity: { x: number } }) => {
    const dx = info.offset.x
    const vx = info.velocity.x
    const power = Math.abs(dx) + Math.abs(vx) * 0.18
    const dir: SwipeDirection = dx > 0 ? 'right' : 'left'
    const pass = power > 280 && Math.abs(dx) > 120
    if (pass) {
      void controls.start({ x: dx > 0 ? 900 : -900, rotate: dx > 0 ? 22 : -22, opacity: 0, transition: { duration: 0.24 } })
        .then(() => onSwiped(data.id, dir))
    } else {
      void controls.start({ x: 0, rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 320, damping: 30 } })
    }
  }

  const onPointerDown = () => { downX.current = x.get(); moved.current = false }
  const onPointerMove = () => { if (Math.abs(x.get() - downX.current) > 6) moved.current = true }
  const onPointerUp = () => { if (!moved.current && onOpenDetails) onOpenDetails(data) }

  // defaults
  const amenities = data.amenities ?? ['Private Entry', 'Desk', 'Fast Wi-Fi', 'King Bed', 'In-Unit Laundry']
  const commuteText = data.commuteText ?? '18 min peak • 12 min night'
  const safetyScore = typeof data.safetyScore === 'number' ? data.safetyScore : 92
  const petPolicy = data.petPolicy ?? 'All pets'
  const scores = data.scores ?? { fit: 95, commute: 82, safety: 97, quality: 89 }
  const meta = `${data.city ?? 'San Francisco'}, ${data.region ?? 'CA'} • ${data.beds ?? 1}bd / ${data.baths ?? 1}ba`

  return (
    <motion.div
      className="absolute inset-0 select-none"
      style={{ zIndex: 100 - index }}
      initial={{ scale: 1 - index * 0.03, y: index * 10, opacity: index === 0 ? 1 : 0.95 }}
      animate={{ scale: 1 - index * 0.03, y: index * 10, opacity: index === 0 ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        whileTap={{ scale: 0.99 }}
        onDragEnd={handleDragEnd}
        style={{ x, rotate, opacity, touchAction: 'pan-y' }}   // allow vertical scroll
        animate={controls}
        className="h-full w-full touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        role="button"
        tabIndex={0}
        aria-label={`${data.title} — $${data.weekly_price}/week`}
      >
        {/* vertical scroller */}
        <div className="h-full w-full overflow-hidden overflow-y-auto overscroll-contain rounded-3xl border border-slate-200 bg-white/95 shadow-xl shadow-slate-900/8">
          {/* HERO MEDIA */}
          <div className="relative w-full aspect-[16/9] bg-slate-900/10">
            {data.video_url ? (
              <video
                className="absolute inset-0 w-full h-full object-cover"
            poster={data.thumb_url || FALLBACK_THUMB}
                src={data.video_url}
                muted
                playsInline
                autoPlay
                loop
                controls={false}
              />
            ) : (
              <img
                className="absolute inset-0 w-full h-full object-cover"
                src={data.thumb_url || FALLBACK_THUMB}
                alt={data.title}
                draggable={false}
              />
            )}
            {data.video_url && (
              <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-800 shadow-sm">
                <Film className="h-3.5 w-3.5 text-sky-600" /> Video tour available
              </div>
            )}
            <div className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/80 px-3 py-1 text-xs text-white shadow">
              WEEKLY <span className="font-semibold">${data.weekly_price}</span>
            </div>
          </div>

          {/* TITLE + META */}
          <div className="px-4 pt-3">
            <h3 className="text-lg font-semibold text-slate-900">{data.title}</h3>
            <div className="text-xs text-slate-500">{meta}</div>
            <p className="mt-2 text-sm text-slate-600">
              {data.notes ?? 'Two-story loft with private keyed entry, secure parking, blackout shades and workspace.'}
            </p>

            {/* amenities chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              {amenities.map((a) => <Pill key={a}>{a}</Pill>)}
            </div>
          </div>

          {/* SECTIONS */}
          <div className="mt-4 space-y-3 px-4 pb-4">
            <div className="rounded-2xl border border-slate-200 bg-white/90">
              <div className="flex items-center gap-3 px-4 py-3">
                <CarFront className="h-5 w-5 text-sky-500" />
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">Commute</div>
                  <div className="text-sm font-medium text-slate-800">{commuteText}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/90">
              <div className="flex items-center gap-3 px-4 py-3">
                <Gauge className="h-5 w-5 text-sky-500" />
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">Safety score</div>
                  <div className="text-sm font-medium text-slate-800">{safetyScore}/100</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/90">
              <div className="flex items-center gap-3 px-4 py-3">
                <Dog className="h-5 w-5 text-sky-500" />
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">Pet policy</div>
                  <div className="text-sm font-medium text-slate-800">{petPolicy}</div>
                </div>
              </div>
            </div>

            {/* MATCH BREAKDOWN */}
            <div className="rounded-2xl border border-slate-200 bg-white/90">
              <div className="px-4 py-3">
                <div className="mb-3 text-[11px] uppercase tracking-wide text-slate-500">Match breakdown</div>
                <div className="space-y-2">
                  <StatRow label="Fit to stipend" score={scores.fit} />
                  <StatRow label="Commute guardrail" score={scores.commute} />
                  <StatRow label="Safety" score={scores.safety} />
                  <StatRow label="Quality" score={scores.quality} />
                </div>

                <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 px-3 py-3">
                  <div className="text-xs font-semibold text-sky-700">Quick Hold</div>
                  <div className="text-xs text-sky-700/90">
                    Reserve for 24 hours with a fully refundable $100 intent hold while we verify ID.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className="h-4 w-4 text-sky-600" />
              Decision feedback shared instantly with owner
            </div>
          </div>
        </div>

        {/* SWIPE LABELS */}
        <motion.div
          className="pointer-events-none absolute left-4 top-4 rounded-xl border-2 border-rose-400 px-3 py-1 font-semibold text-rose-500"
          style={{ opacity: useTransform(x, [-240, -120], [1, 0]) }}
        >
          NOPE
        </motion.div>
        <motion.div
          className="pointer-events-none absolute right-4 top-4 rounded-xl border-2 border-sky-400 px-3 py-1 font-semibold text-sky-500"
          style={{ opacity: useTransform(x, [120, 240], [0, 1]) }}
        >
          LIKE
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
