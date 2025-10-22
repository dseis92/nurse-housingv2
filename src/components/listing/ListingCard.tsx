import { MapPin, Bolt, CarFront, ShieldCheck, Moon, Heart } from 'lucide-react'
import type { Listing } from '../../types'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { useFavStore } from '../../stores/favorites'
import { cn } from '../../lib/utils'

export default function ListingCard({ l, score }: { l: Listing; score: number }) {
  const toggle = useFavStore(s=>s.toggle); const isFav = useFavStore(s=>s.isFav)(l.id)
  return (
    <div className="overflow-hidden rounded-2xl bg-zinc-50 shadow-card">
      <div className="relative">
        <img src={l.photos[0]} alt={l.title} className="h-56 w-full object-cover"/>
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className={cn(score>=80?'bg-teal-600 text-white border-transparent':score>=60?'bg-pink-500 text-white border-transparent':'bg-white text-zinc-800')}>
            Match {score}%
          </Badge>
          {l.features.instantBook && <Badge className="bg-pink-500 text-white border-transparent">Instant Book</Badge>}
        </div>
        <button onClick={()=>toggle(l.id)} className="absolute right-3 top-3 rounded-full bg-white/90 p-2 hover:bg-white">
          <Heart className={cn('h-5 w-5', isFav?'fill-pink-500 text-pink-500':'text-zinc-700')}/>
        </button>
      </div>
      <div className="p-4 md:p-6 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{l.title}</h3>
            <p className="text-sm text-zinc-600">{l.intro}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">${l.weeklyAllIn}<span className="text-sm text-zinc-500">/wk</span></div>
            <div className="text-xs text-zinc-500">All-in pricing</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4"/> {l.hospitalDistanceMin} min to hospital</span>
          {l.features.quiet && <span className="inline-flex items-center gap-1"><Moon className="h-4 w-4"/> Day-sleeper</span>}
          {l.features.safe && <span className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4"/> Safe area</span>}
          {l.features.parking.available && <span className="inline-flex items-center gap-1"><CarFront className="h-4 w-4"/> Parking</span>}
          {l.features.parking.ev && <span className="inline-flex items-center gap-1"><Bolt className="h-4 w-4"/> EV</span>}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {l.features.pet.allowed && <Badge>Pet friendly</Badge>}
            {l.features.parking.largeVehicle && <Badge>Large vehicle OK</Badge>}
          </div>
          <Button>View & Book</Button>
        </div>
      </div>
    </div>
  )
}
