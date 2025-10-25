import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown, LogOut, LogIn, Home, Shield, PlusSquare, Heart, User } from 'lucide-react'
import { useSession } from './stores/session'

function NavButton({ to, children, onClick }: { to: string, children: React.ReactNode, onClick?: ()=>void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${isActive ? 'bg-neutral-100 font-semibold' : 'hover:bg-neutral-50'}`
      }
    >
      {children}
    </NavLink>
  )
}

export default function App() {
  const { session, role, refresh, signOut } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [acctOpen, setAcctOpen] = useState(false)
  const nav = useNavigate()

  useEffect(() => { refresh() }, [])

  const closeAll = () => { setMobileOpen(false); setAcctOpen(false) }

  return (
    <div className="min-h-full flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto max-w-6xl px-4 h-16 grid grid-cols-[auto_1fr_auto] items-center gap-3">
          {/* Clickable Logo → Home */}
          <Link to="/" onClick={closeAll} className="font-extrabold text-lg tracking-tight">
            Nurse<span className="text-brand">Match</span>
            <span className="sr-only">Go Home</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavButton to="/"><Home className="w-4 h-4" /> Home</NavButton>
            <NavButton to="/shortlist"><Heart className="w-4 h-4" /> Shortlist</NavButton>
            <NavButton to="/owner/listing/new"><PlusSquare className="w-4 h-4" /> List</NavButton>
            <NavButton to="/admin"><Shield className="w-4 h-4" /> Admin</NavButton>
          </nav>

          {/* Right side: account + mobile burger */}
          <div className="flex items-center gap-2 justify-self-end">
            {/* Desktop account dropdown */}
            <div className="relative hidden md:block">
              <button
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-neutral-50"
                onClick={() => setAcctOpen(v => !v)}
                aria-haspopup="menu"
                aria-expanded={acctOpen}
              >
                <User className="w-4 h-4" />
                <span className="text-sm">{session ? (session.user.email?.split('@')[0] ?? 'Account') : 'Account'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {acctOpen && (
                <div className="absolute right-0 mt-2 w-56 card p-2 shadow-lg" role="menu">
                  {session ? (
                    <>
                      <NavLink to="/onboarding" onClick={closeAll} className="block px-3 py-2 rounded-lg hover:bg-neutral-50 text-sm">Onboarding / Preferences</NavLink>
                      <NavLink to="/shortlist" onClick={closeAll} className="block px-3 py-2 rounded-lg hover:bg-neutral-50 text-sm">My Shortlist</NavLink>
                      {(role === 'owner' || role === 'admin') && (
                        <NavLink to="/owner/listing/new" onClick={closeAll} className="block px-3 py-2 rounded-lg hover:bg-neutral-50 text-sm">Create Listing</NavLink>
                      )}
                      {role === 'admin' && (
                        <NavLink to="/admin" onClick={closeAll} className="block px-3 py-2 rounded-lg hover:bg-neutral-50 text-sm">Admin Panel</NavLink>
                      )}
                      <button
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-50 text-sm inline-flex items-center gap-2 mt-1"
                        onClick={async ()=>{ await signOut(); closeAll(); nav('/login') }}
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </>
                  ) : (
                    <NavLink to="/login" onClick={closeAll} className="block px-3 py-2 rounded-lg hover:bg-neutral-50 text-sm inline-flex items-center gap-2">
                      <LogIn className="w-4 h-4" /> Sign in
                    </NavLink>
                  )}
                </div>
              )}
            </div>

            {/* Mobile burger */}
            <button
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border hover:bg-neutral-50"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-1">
              <NavButton to="/" onClick={closeAll}><Home className="w-4 h-4" /> Home</NavButton>
              <NavButton to="/shortlist" onClick={closeAll}><Heart className="w-4 h-4" /> Shortlist</NavButton>
              <NavButton to="/owner/listing/new" onClick={closeAll}><PlusSquare className="w-4 h-4" /> List</NavButton>
              <NavButton to="/admin" onClick={closeAll}><Shield className="w-4 h-4" /> Admin</NavButton>

              <div className="h-px bg-neutral-200 my-2" />
              {session ? (
                <>
                  <NavLink to="/onboarding" onClick={closeAll} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-neutral-50">
                    <User className="w-4 h-4" /> Onboarding / Preferences
                  </NavLink>
                  <button
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-neutral-50"
                    onClick={async ()=>{ await signOut(); closeAll(); nav('/login') }}
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </>
              ) : (
                <NavLink to="/login" onClick={closeAll} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-neutral-50">
                  <LogIn className="w-4 h-4" /> Sign in
                </NavLink>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Page outlet */}
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-neutral-500">
        Built for travel nurses — swipe, match, and book safely.
      </footer>

      {/* click-away to close menus */}
      {(acctOpen || mobileOpen) && (
        <div className="fixed inset-0 z-40" onClick={closeAll} aria-hidden="true" />
      )}
    </div>
  )
}
