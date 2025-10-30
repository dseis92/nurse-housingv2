import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useAppStore } from "../../stores/useAppStore";
import { navByRole } from "./navConfig";
import { Building2 } from "lucide-react";

export default function SidebarNav() {
  const role = useAppStore((state) => state.currentRole);

  const navItems = useMemo(() => navByRole[role], [role]);

  return (
    <aside className="relative hidden lg:block lg:w-72 xl:w-80">
      <div className="sticky top-28 mx-auto flex w-[260px] flex-col gap-8 rounded-3xl border border-[var(--nh-border)] bg-[var(--nh-surface)] p-6 shadow-[var(--nh-shadow-soft)]">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--nh-accent-soft)] text-[var(--nh-accent)]">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--nh-text-primary)]">NurseStays</p>
            <p className="text-xs text-[var(--nh-text-secondary)]">Stays curated for travel nurses</p>
          </div>
        </div>

        <nav className="space-y-2 text-sm font-medium">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "group flex items-center gap-3 rounded-2xl px-4 py-2 transition",
                  isActive
                    ? "bg-[var(--nh-surface-muted)] text-[var(--nh-text-primary)] shadow-[0_6px_16px_rgba(34,34,34,0.08)]"
                    : "text-[var(--nh-text-secondary)] hover:bg-[var(--nh-surface-muted)] hover:text-[var(--nh-text-primary)]",
                ].join(" ")
              }
              end={item.to === "/"}
            >
              <item.icon className="h-4 w-4 shrink-0 text-[var(--nh-accent)] transition group-hover:text-[var(--nh-accent)]" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="rounded-2xl border border-[var(--nh-border)] bg-[var(--nh-surface-muted)] p-4 text-xs text-[var(--nh-text-secondary)]">
          <p className="font-semibold text-[var(--nh-text-primary)]">Need help?</p>
          <p>Our concierge can shortlist vetted stays for your next assignment.</p>
        </div>

        <div className="text-xs text-[var(--nh-text-secondary)]">
          © {new Date().getFullYear()} NurseStays Collective
        </div>
      </div>
    </aside>
  );
}
