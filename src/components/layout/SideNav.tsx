import { NavLink } from 'react-router-dom'
import { MessagesSquare, Heart, User } from 'lucide-react'

const itemBase =
  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-neutral-50 active:bg-neutral-100'
const active =
  'bg-neutral-100 font-medium text-neutral-900'
const idle =
  'text-neutral-700 hover:text-neutral-900'

export default function SideNav() {
  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-60 border-r bg-white p-3">
      <div className="px-2 py-3">
        <div className="text-lg font-semibold">Nurse Housing</div>
        <div className="text-xs text-neutral-500">Swipe • Match • Stay</div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-2">
        <NavLink
          to="/matches"
          className={({ isActive }) =>
            `${itemBase} ${isActive ? active : idle}`
          }
        >
          <MessagesSquare className="w-4 h-4" /> Matches
        </NavLink>

        <NavLink
          to="/shortlist"
          className={({ isActive }) =>
            `${itemBase} ${isActive ? active : idle}`
          }
        >
          <Heart className="w-4 h-4" /> Short list
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${itemBase} ${isActive ? active : idle}`
          }
        >
          <User className="w-4 h-4" /> Profile
        </NavLink>
      </nav>

      <div className="px-2 text-xs text-neutral-400">© 2025</div>
    </aside>
  )
}
