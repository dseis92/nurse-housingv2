import { NavLink } from "react-router-dom";
import { useMemo } from "react";
import { navByRole } from "./navConfig";
import { useAppStore } from "../../stores/useAppStore";

export default function MobileNav() {
  const role = useAppStore((state) => state.currentRole);
  const navItems = useMemo(() => navByRole[role], [role]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/70 bg-white/80 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur-md supports-[backdrop-filter]:bg-white/70 lg:hidden">
      <ul className="flex items-center justify-between px-6 py-3 text-xs font-medium text-slate-500">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === "/"}
              aria-label={item.label}
            >
              {({ isActive }) => (
                <span
                  className={[
                    "group inline-flex flex-col items-center gap-1 rounded-full px-3 py-1 transition",
                    isActive
                      ? "bg-sky-100/80 text-sky-700 shadow-sm shadow-sky-900/10"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                  ].join(" ")}
                >
                  <item.icon
                    className={[
                      "h-5 w-5 transition",
                      isActive ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600",
                    ].join(" ")}
                  />
                  <span className="text-[11px] leading-none">{item.label}</span>
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
