import { HeartHandshake } from 'lucide-react'
export default function TopBar(){
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="container-constraint flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartHandshake className="h-6 w-6 text-pink-500"/><span className="font-semibold">Nurse Housing</span>
        </div>
        <nav className="text-sm text-zinc-600"><a href="#" className="hover:text-pink-500">How it works</a></nav>
      </div>
    </header>
  )
}
