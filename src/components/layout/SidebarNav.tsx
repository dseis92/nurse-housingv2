import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useAppStore } from "../../stores/useAppStore";
import { navByRole } from "./navConfig";
import { Building2 } from "lucide-react";

export default function SidebarNav() {
  const role = useAppStore((state) => state.currentRole);

  const navItems = useMemo(() => navByRole[role], [role]);

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-slate-900/20 lg:bg-gradient-to-b lg:from-slate-950 lg:via-slate-900 lg:to-slate-900/95 lg:text-slate-200">
      <div className="flex h-20 items-center gap-3 px-6">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-sky-300 shadow-inner shadow-black/20">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">ShiftMatch Homes</p>
          <p className="text-xs text-slate-400">Travel Nurse Housing</p>
        </div>
      </div>
      <div className="flex-1 space-y-8 overflow-y-auto px-4 pb-8 pt-6">
        <nav className="space-y-1 text-sm font-medium text-slate-300">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "group flex items-center gap-3 rounded-xl px-3 py-2 transition",
                  isActive
                    ? "bg-white/12 text-white shadow-inner shadow-white/10 ring-1 ring-white/15"
                    : "text-slate-300 hover:bg-white/8 hover:text-white",
                ].join(" ")
              }
              end={item.to === "/"}
            >
              <item.icon className="h-4 w-4 shrink-0 text-sky-300 transition group-hover:text-sky-200" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="border-t border-white/10 px-6 py-4 text-xs text-slate-400">
        © {new Date().getFullYear()} ShiftMatch Labs
      </div>
    </aside>
  );
}
