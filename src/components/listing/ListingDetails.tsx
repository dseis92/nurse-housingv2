import { LISTINGS } from '../../lib/data/listings'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Bolt, CarFront, ShieldCheck, Moon, PawPrint } from 'lucide-react'

export default function ListingDetails({ id }: { id: string }) {
  const l = LISTINGS.find(x => x.id === id)
  if (!l) return <div className="text-sm text-zinc-600">Listing not found.</div>

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2">
        <img src={l.photos[0]} alt={l.title} className="h-56 w-full rounded-xl object-cover md:h-64" />
        <img src={l.photos[1] || l.photos[0]} alt={l.title} className="hidden h-56 w-full rounded-xl object-cover md:block md:h-64" />
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{l.title}</h3>
          <p className="text-sm text-zinc-600">{l.intro}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {l.features.quiet && <span className="inline-flex items-center gap-1"><Moon className="h-4 w-4" /> Day-sleeper friendly</span>}
            {l.features.safe && <span className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Safe area</span>}
            {l.features.pet.allowed && <span className="inline-flex items-center gap-1"><PawPrint className="h-4 w-4" /> Pets ok</span>}
            {l.features.parking.available && <span className="inline-flex items-center gap-1"><CarFront className="h-4 w-4" /> Parking</span>}
            {l.features.parking.ev && <span className="inline-flex items-center gap-1"><Bolt className="h-4 w-4" /> EV charging</span>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">${l.weeklyAllIn}<span className="text-sm text-zinc-500">/wk</span></div>
          <div className="text-xs text-zinc-500">All-in pricing</div>
          {l.features.instantBook && <Badge className="mt-2 bg-pink-500 text-white border-transparent">Instant Book</Badge>}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200">
        <div className="grid grid-cols-2 gap-0 text-sm">
          <div className="border-b border-zinc-200 p-3">Availability</div>
          <div className="border-b border-zinc-200 p-3 text-zinc-700">
            {l.availability.start} → {l.availability.end}
          </div>

          <div className="p-3">Fees (included)</div>
          <div className="p-3 text-zinc-700 space-y-1">
            <div>Rent: <span className="font-medium">${l.fees.rentWeekly}/wk</span></div>
            <div>Utilities: <span className="font-medium">${l.fees.utilitiesWeekly}/wk</span></div>
            <div>Cleaning: <span className="font-medium">${l.fees.cleaningWeekly}/wk</span></div>
            <div>Parking: <span className="font-medium">${l.fees.parkingWeekly}/wk</span></div>
            <div>Pet: <span className="font-medium">${l.fees.petWeekly}/wk</span></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline">Request Extension</Button>
        <Button>Instant Apply</Button>
      </div>
    </div>
  )
}
