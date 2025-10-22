import { useFilterStore } from '../stores/filters'
import { HOSPITALS } from '../lib/data/hospitals'
import { PawPrint, CarFront, Bolt, Truck, Moon, Shield } from 'lucide-react'

export default function FilterBar(){
  const { filters, setDates, setHospital, toggle, reset } = useFilterStore()
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-card">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="flex items-center gap-2">
          <input type="date" aria-label="Start" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                 value={filters.dates.start||''} onChange={e=>setDates(e.target.value||undefined, filters.dates.end)} />
          <span className="text-zinc-400 text-sm">to</span>
          <input type="date" aria-label="End" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                 value={filters.dates.end||''} onChange={e=>setDates(filters.dates.start, e.target.value||undefined)} />
        </div>
        <div>
          <select aria-label="Hospital" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  value={filters.hospital||''} onChange={e=>setHospital(e.target.value||undefined)}>
            <option value="">Select Hospital</option>
            {HOSPITALS.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={()=>toggle('pet')} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${filters.pet?'bg-teal-600 text-white border-teal-700':'bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-50'}`}><PawPrint className="h-4 w-4"/>Pets</button>
          <button onClick={()=>toggle('parking')} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${filters.parking?'bg-teal-600 text-white border-teal-700':'bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-50'}`}><CarFront className="h-4 w-4"/>Parking</button>
          <button onClick={()=>toggle('ev')} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${filters.ev?'bg-teal-600 text-white border-teal-700':'bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-50'}`}><Bolt className="h-4 w-4"/>EV</button>
          <button onClick={()=>toggle('largeVehicle')} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${filters.largeVehicle?'bg-teal-600 text-white border-teal-700':'bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-50'}`}><Truck className="h-4 w-4"/>Large Vehicle</button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={()=>toggle('quiet')} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${filters.quiet?'bg-teal-600 text-white border-teal-700':'bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-50'}`}><Moon className="h-4 w-4"/>Quiet</button>
          <button onClick={()=>toggle('safe')} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${filters.safe?'bg-teal-600 text-white border-teal-700':'bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-50'}`}><Shield className="h-4 w-4"/>Safe</button>
          <button onClick={reset} className="ml-auto inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-50">Reset</button>
        </div>
      </div>
    </div>
  )
}
