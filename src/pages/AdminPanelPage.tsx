import { ShieldCheck, Users } from "lucide-react";
import AdminOverview from "../components/panels/AdminOverview";
import ListingTable from "../components/panels/ListingTable";
import { useAppStore } from "../stores/useAppStore";

export default function AdminPanelPage() {
  const listings = useAppStore((state) => state.listings);
  const verifications = useAppStore((state) => state.verifications);

  return (
    <div className="space-y-10">
      <section className="rounded-[36px] border border-[var(--nh-border)] bg-white/95 p-8 shadow-[var(--nh-shadow-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
              Ops control
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--nh-text-primary)]">
              Launch pad – San Francisco
            </h1>
            <p className="mt-3 max-w-xl text-sm text-[var(--nh-text-secondary)]">
              Track verified inventory, guardrail compliance, and hold velocity before expanding to the next metro.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-[var(--nh-text-secondary)]">
            <Badge icon={ShieldCheck} label="RLS enforced" />
            <Badge icon={Users} label={`${verifications.length} verifications`} />
          </div>
        </div>
      </section>

      <AdminOverview />

      <section className="space-y-4">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
            Inventory health
          </p>
          <h2 className="text-xl font-semibold text-[var(--nh-text-primary)]">Active furnished rentals</h2>
        </header>
        <ListingTable listings={listings} />
      </section>
    </div>
  );
}

interface BadgeProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function Badge({ icon: Icon, label }: BadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--nh-border)] bg-white px-4 py-2 font-semibold text-[var(--nh-text-secondary)]">
      <Icon className="h-4 w-4 text-[var(--nh-accent)]" />
      {label}
    </span>
  );
}
