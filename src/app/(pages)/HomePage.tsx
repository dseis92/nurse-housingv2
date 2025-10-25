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
import Onboarding from '../../components/Onboarding'
import { motion } from 'framer-motion'
import { containerStagger, itemCard } from '../../lib/motion'
import ScrollProgress from '../../components/ScrollProgress'
import StickyNav from '../../components/StickyNav'
import FullHero from '../../components/FullHero'
import FeatureTriad from '../../components/FeatureTriad'

export default function HomePage(){
  const filters = useFilterStore(s=>s.filters)
  const [loading,setLoading]=useState(true)
  const data = LISTINGS
  const selectedId = useUIStore(s=>s.selectedId)
  const close = useUIStore(s=>s.close)

  useEffect(()=>{ const t=setTimeout(()=>setLoading(false),450); return ()=>clearTimeout(t)},[])

  const results = data
    .filter(l=>{
      const {start,end}=filters.dates||{}
      if(start&&end){
        const ok = new Date(l.availability.start)<=new Date(start) && new Date(l.availability.end)>=new Date(end)
        if(!ok) return false
      }
      if((filters as any).pet && !l.features.pet.allowed) return false
      if((filters as any).parking && !l.features.parking.available) return false
      if((filters as any).ev && !l.features.parking.ev) return false
      if((filters as any).largeVehicle && !l.features.parking.largeVehicle) return false
      if((filters as any).quiet && !l.features.quiet) return false
      if((filters as any).safe && !l.features.safe) return false
      return true
    })
    .map(l=>({l,score:computeMatch(l,filters)}))
    .sort((a,b)=>b.score-a.score)

  return (
    <main>
      <ScrollProgress />
      <TopBar/>
      <FullHero/>
      <StickyNav/>

      <section className="container-constraint pt-4" id="results">
        <motion.div
          className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          variants={containerStagger as any}
          initial="hidden"
          animate="show"
        >
          {loading
            ? Array.from({length:6}).map((_,i)=>(
                <motion.div key={`s-${i}`} className="h-80 rounded-2xl bg-zinc-200" variants={itemCard as any}/>
              ))
            : results.map(({l,score})=>(
                <motion.div key={l.id} variants={itemCard as any}>
                  <ListingCard l={l} score={score}/>
                </motion.div>
              ))
          }
        </motion.div>

        {!loading && results.length===0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 rounded-2xl border border-dashed border-zinc-300 p-8 text-center">
            <div className="text-lg font-semibold">No perfect matches yet</div>
            <p className="mt-1 text-sm text-zinc-600">Try relaxing a filter or widening your dates.</p>
          </motion.div>
        )}
      </section>

      <FeatureTriad/>

      <Onboarding/>

      <Modal open={!!selectedId} onClose={close} title="Home Details">
        {selectedId ? <ListingDetails id={selectedId}/> : null}
      </Modal>

      <footer className="mt-12 border-t border-zinc-200 py-8 text-center text-sm text-zinc-500">
        Built for traveling nurses. Transparent. Quiet-friendly. All-in weekly prices.
      </footer>
    </main>
  )
}
