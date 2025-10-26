import { useEffect, useRef, useState } from 'react'
import { useSession } from '../../stores/session'
import { Link } from 'react-router-dom'
import SignOutButton from './SignOutButton'

export default function AccountMenu({ floating = false }:{ floating?: boolean }) {
  const { session } = useSession()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const name = session?.user?.email || 'Account'
  const initials = name?.[0]?.toUpperCase?.() || 'A'
  const wrapper = floating ? 'fixed top-3 right-3 z-40' : 'relative'

  return (
    <div className={wrapper} ref={ref}>
      <button
        type="button"
        className="btn btn-outline gap-2"
        onClick={()=>setOpen(v=>!v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-neutral-200 text-xs">{initials}</span>
        <span className="hidden sm:block">{name}</span>
      </button>

      {open && (
        <div role="menu" className="menu absolute right-0 mt-2 min-w-52">
          <Link to="/" className="menu-item">Home</Link>
          <Link to="/onboarding" className="menu-item">Onboarding</Link>
          <Link to="/shortlist" className="menu-item">Shortlist</Link>
          <div className="h-px my-1 bg-neutral-200" />
          <SignOutButton />
        </div>
      )}
    </div>
  )
}
