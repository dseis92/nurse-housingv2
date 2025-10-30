import { Link } from "react-router-dom";
import { Compass, Handshake, Rocket } from "lucide-react";
import ListingTable from "../components/panels/ListingTable";
import { useAppStore } from "../stores/useAppStore";

export default function OwnerHubPage() {
  const listings = useAppStore((state) => state.listings);
  const matches = useAppStore((state) => state.matches);

  return (
    <div className="space-y-10">
      <section className="rounded-[36px] border border-[var(--nh-border)] bg-white/95 p-8 shadow-[var(--nh-shadow-soft)]">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">Owner portal</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--nh-text-primary)]">
              Boost your nurse-friendly rentals
            </h1>
            <p className="mt-3 max-w-xl text-sm text-[var(--nh-text-secondary)]">
              Review match insights and activate Boost for higher placement in nurse swipe queues over the next 48 hours.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3 text-xs text-[var(--nh-text-secondary)]">
            <Link
              to="/owner/new"
              className="btn btn-primary"
            >
              <Rocket className="h-4 w-4" />
              Launch new listing
            </Link>
            <Link
              to="/owner/listings"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--nh-accent)] hover:underline"
            >
              Manage listings
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OwnerMetric
          icon={Compass}
          label="Active listings"
          value={listings.length}
          helper="Live in San Francisco metro"
        />
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
    <div className="rounded-3xl border border-[var(--nh-border)] bg-white/90 p-5 shadow-[var(--nh-shadow-soft)]">
      <div className="flex items-center justify-between text-xs text-[var(--nh-text-secondary)]">
        <Icon className="h-5 w-5 text-[var(--nh-accent)]" />
        <span className="uppercase tracking-[0.18em]">{helper}</span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-[var(--nh-text-primary)]">{value}</p>
      <p className="text-xs text-[var(--nh-text-secondary)]">{label}</p>
    </div>
  );
}
