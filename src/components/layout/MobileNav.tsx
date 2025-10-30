import { NavLink } from "react-router-dom";
import { useMemo } from "react";
import { navByRole } from "./navConfig";
import { useAppStore } from "../../stores/useAppStore";

export default function MobileNav() {
  const role = useAppStore((state) => state.currentRole);
  const navItems = useMemo(() => navByRole[role], [role]);

  return (
    <nav className="fixed inset-x-3 bottom-4 z-40 rounded-full border border-[var(--nh-border)] bg-white/95 px-4 py-3 shadow-[0_18px_40px_rgba(34,34,34,0.14)] backdrop-blur-md lg:hidden">
      <ul className="flex items-center justify-between text-[11px] font-medium text-[var(--nh-text-secondary)]">
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
                      ? "bg-[var(--nh-accent-soft)] text-[var(--nh-accent)]"
                      : "text-[var(--nh-text-secondary)] hover:bg-[var(--nh-surface-muted)] hover:text-[var(--nh-text-primary)]",
                  ].join(" ")}
                >
                  <item.icon
                    className={[
                      "h-5 w-5 transition",
                      isActive
                        ? "text-[var(--nh-accent)]"
                        : "text-[var(--nh-text-secondary)] group-hover:text-[var(--nh-text-primary)]",
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
