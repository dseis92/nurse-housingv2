import { Outlet, Link } from 'react-router-dom'
import SideNav from './components/layout/SideNav'

export default function App() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Desktop sidebar */}
      <SideNav />

      {/* Content area (adds left padding when sidebar is visible) */}
      <div className="md:pl-60">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 bg-white border-b">
          <div className="h-12 flex items-center justify-between px-3">
            <Link to="/" className="font-semibold">Nurse Housing</Link>
            <Link to="/profile" className="text-sm text-neutral-600">Profile</Link>
          </div>
        </header>

        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
