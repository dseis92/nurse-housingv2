import TopBar from '../../components/TopBar'
import FilterBar from '../../components/FilterBar'
import ListingCard from '../../components/listing/ListingCard'
import Modal from '../../components/ui/Modal'
import ListingDetails from '../../components/listing/ListingDetails'
import { LISTINGS } from '../../lib/data/listings'
import { useFilterStore } from '../../stores/filters'
import { computeMatch } from '../../lib/match'
import { useEffect, useState } from 'react'
import { useUIStore } from '../../stores/ui'

export default function HomePage(){
  const filters = useFilterStore(s=>s.filters)
  const [loading,setLoading]=useState(true)
  const [data]=useState(LISTINGS)
  const selectedId = useUIStore(s=>s.selectedId)
  const close = useUIStore(s=>s.close)

  useEffect(()=>{ const t=setTimeout(()=>setLoading(false),500); return ()=>clearTimeout(t)},[])

  const results = data
    .filter(l=>{
      const {start,end}=filters.dates||{}
      if(start&&end){
        const ok = new Date(l.availability.start)<=new Date(start) && new Date(l.availability.end)>=new Date(end)
        if(!ok) return false
      }
      if(filters.pet && !l.features.pet.allowed) return false
      if(filters.parking && !l.features.parking.available) return false
      if(filters.ev && !l.features.parking.ev) return false
      if(filters.largeVehicle && !l.features.parking.largeVehicle) return false
      if(filters.quiet && !l.features.quiet) return false
      if(filters.safe && !l.features.safe) return false
      return true
    })
    .map(l=>({l,score:computeMatch(l,filters)}))
    .sort((a,b)=>b.score-a.score)

  return (
    <main>
      <TopBar/>
      <section className="container-constraint pt-6 md:pt-8">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-bold">Your next home, but make it a match 💘</h1>
          <p className="text-sm text-zinc-600">Set dates, pick a hospital, toggle must-haves. We surface nurse-friendly homes with all-in pricing.</p>
        </div>
        <FilterBar/>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({length:6}).map((_,i)=>(<div key={i} className="h-80 animate-pulse rounded-2xl bg-zinc-200"/>))
            : results.map(({l,score})=>(<ListingCard key={l.id} l={l} score={score}/>))
          }
        </div>
        {!loading && results.length===0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 p-8 text-center">
            <div className="text-lg font-semibold">No perfect matches yet</div>
            <p className="mt-1 text-sm text-zinc-600">Try relaxing a filter or widening your dates.</p>
          </div>
        )}
      </section>

      <Modal open={!!selectedId} onClose={close} title="Home Details">
        {selectedId ? <ListingDetails id={selectedId}/> : null}
      </Modal>

      <footer className="mt-12 border-t border-zinc-200 py-8 text-center text-sm text-zinc-500">
        Built for traveling nurses. Transparent. Quiet-friendly. All-in weekly prices.
      </footer>
    </main>
  )
}
