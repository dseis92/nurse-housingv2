import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  ListPlus,
  MessageCircle,
  Sparkles,
  Home,
} from "lucide-react";
import type { UserRole } from "../../types";

export interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const navByRole: Record<UserRole, NavItem[]> = {
  nurse: [
    { label: "Overview", to: "/", icon: LayoutDashboard },
    { label: "Onboarding", to: "/onboarding", icon: Sparkles },
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

