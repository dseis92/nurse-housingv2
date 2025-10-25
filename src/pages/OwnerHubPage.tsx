import { Link } from "react-router-dom";
import { Compass, Handshake, Rocket } from "lucide-react";
import ListingTable from "../components/panels/ListingTable";
import { useAppStore } from "../stores/useAppStore";

export default function OwnerHubPage() {
  const listings = useAppStore((state) => state.listings);
  const matches = useAppStore((state) => state.matches);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-teal-600">Owner portal</p>
            <h1 className="text-2xl font-semibold text-zinc-900">Boost your nurse-friendly rentals</h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-600">
              Review match insights and activate Boost for higher placement in nurse swipe queues over the next 48 hours.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-xs text-zinc-500">
            <Link
              to="/owner/new"
              className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-500"
            >
              <Rocket className="h-4 w-4" />
              Launch new listing
            </Link>
            <Link
              to="/owner/listings"
              className="inline-flex items-center gap-2 text-xs font-semibold text-teal-600 hover:text-teal-500"
            >
              Manage listings
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OwnerMetric icon={Compass} label="Active listings" value={listings.length} helper="Live in San Francisco metro" />
        <OwnerMetric icon={Handshake} label="Matches this week" value={matches.length} helper="Swipe activity" />
        <OwnerMetric icon={Rocket} label="Boost credits" value={3} helper="Included with pro plan" />
        <OwnerMetric icon={Compass} label="Average safety score" value={88} helper="Verified features" />
      </section>

      <ListingTable listings={listings} />
    </div>
  );
}

interface OwnerMetricProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  helper: string;
}

function OwnerMetric({ icon: Icon, label, value, helper }: OwnerMetricProps) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-teal-600" />
        <span className="text-[10px] uppercase tracking-wide text-zinc-400">{helper}</span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-zinc-900">{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}

