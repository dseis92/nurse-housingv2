import { useState } from 'react'
export default function OwnerListingForm() {
  const [title, setTitle] = useState('')
  return (
    <div className="max-w-xl mx-auto card p-6">
      <h1 className="text-xl font-bold mb-3">Create listing</h1>
      <input className="w-full border rounded-xl px-3 py-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
      <div className="text-xs text-neutral-500 mt-3">Supabase wiring will save this when configured.</div>
    </div>
  )
}
