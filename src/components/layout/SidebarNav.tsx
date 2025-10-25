import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { Building2, ClipboardList, Home, LayoutDashboard, ListPlus, MessageCircle, Sparkles } from "lucide-react";
import { useAppStore } from "../../stores/useAppStore";
import type { UserRole } from "../../types";

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navByRole: Record<UserRole, NavItem[]> = {
  nurse: [
    { label: "Overview", to: "/", icon: LayoutDashboard },
    { label: "Contract Intake", to: "/nurse/contract", icon: ClipboardList },
    { label: "Swipe Queue", to: "/swipe", icon: Sparkles },
    { label: "Shortlist", to: "/shortlist", icon: Home },
    { label: "Matches & Chat", to: "/matches", icon: MessageCircle },
  ],
  owner: [
    { label: "Owner Hub", to: "/owner", icon: LayoutDashboard },
    { label: "Listings", to: "/owner/listings", icon: Building2 },
    { label: "Create Listing", to: "/owner/new", icon: ListPlus },
    { label: "Messages", to: "/owner/messages", icon: MessageCircle },
  ],
  admin: [
    { label: "Ops Dashboard", to: "/admin", icon: LayoutDashboard },
    { label: "Metro Inventory", to: "/admin/listings", icon: Building2 },
    { label: "Contracts", to: "/admin/contracts", icon: ClipboardList },
    { label: "Support Inbox", to: "/admin/messages", icon: MessageCircle },
  ],
};

export default function SidebarNav() {
  const role = useAppStore((state) => state.currentRole);

  const navItems = useMemo(() => navByRole[role], [role]);

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-zinc-200 lg:bg-white">
      <div className="flex h-16 items-center gap-2 px-6">
        <Building2 className="h-6 w-6 text-teal-600" />
        <div>
          <p className="text-sm font-semibold text-zinc-900">ShiftMatch Homes</p>
          <p className="text-xs text-zinc-500">Travel Nurse Housing</p>
        </div>
      </div>
      <div className="flex-1 space-y-8 overflow-y-auto px-4 pb-8 pt-6">
        <nav className="space-y-1 text-sm font-medium text-zinc-500">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "group flex items-center gap-3 rounded-lg px-3 py-2 transition",
                  isActive ? "bg-zinc-100 text-zinc-900" : "hover:bg-zinc-50 hover:text-zinc-900",
                ].join(" ")
              }
              end={item.to === "/"}
            >
              <item.icon className="h-4 w-4 shrink-0 text-teal-600 transition group-hover:text-teal-500" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="border-t border-zinc-100 px-6 py-4 text-xs text-zinc-500">
        © {new Date().getFullYear()} ShiftMatch Labs
      </div>
    </aside>
  );
}
