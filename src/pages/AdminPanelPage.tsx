import { ShieldCheck, Users } from "lucide-react";
import AdminOverview from "../components/panels/AdminOverview";
import ListingTable from "../components/panels/ListingTable";
import { useAppStore } from "../stores/useAppStore";

export default function AdminPanelPage() {
  const listings = useAppStore((state) => state.listings);
  const verifications = useAppStore((state) => state.verifications);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-sky-600">Ops control</p>
            <h1 className="text-2xl font-semibold text-slate-900">Launch pad – San Francisco</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Track verified inventory, guardrail compliance, and hold velocity before expanding to the next metro.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <Badge icon={ShieldCheck} label="RLS enforced" />
            <Badge icon={Users} label={`${verifications.length} verifications`} />
          </div>
        </div>
      </section>

      <AdminOverview />

      <section className="space-y-4">
        <header>
          <p className="text-xs uppercase tracking-wide text-sky-600">Inventory health</p>
          <h2 className="text-lg font-semibold text-slate-900">Active furnished rentals</h2>
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
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
      <Icon className="h-4 w-4 text-sky-600" />
      {label}
    </span>
  );
}

