import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  Gauge,
  LayoutGrid,
  Map as MapIcon,
  MapPin,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import AdminOverview from "../components/panels/AdminOverview";
import ListingTable from "../components/panels/ListingTable";
import ShortlistBoard from "../components/panels/ShortlistBoard";
import { selectActiveContract, selectCurrentNurseProfile, useAppStore } from "../stores/useAppStore";
import ListingMap from "../components/map/ListingMap";
import ListingExploreCard from "../components/listings/ListingExploreCard";

export default function DashboardPage() {
  const role = useAppStore((state) => state.currentRole);

  if (role === "owner") {
    return <OwnerDashboard />;
  }

  if (role === "admin") {
    return <AdminDashboard />;
  }

  return <NurseDashboard />;
}

function NurseDashboard() {
  const contract = useAppStore(selectActiveContract);
  const nurseProfile = useAppStore(selectCurrentNurseProfile);
  const listings = useAppStore((state) => state.listings);
  const shortlistCount = useAppStore((state) => state.shortlist.length);
  const [view, setView] = useState<"grid" | "map">("grid");
  const [activeFilter, setActiveFilter] = useState<string>("verified");
  const commuteLimit = nurseProfile?.preferences.commute.maxMinutes ?? 30;

  const heroListings = useMemo(() => listings.slice(0, 8), [listings]);

  const mapListings = useMemo(
    () =>
      heroListings.map((listing) => ({
        id: listing.id,
        title: listing.title,
        lat: listing.lat,
        lng: listing.lng,
        nightlyPrice: Math.round(listing.weeklyPrice / 7),
      })),
    [heroListings]
  );

  const stats = useMemo(() => {
    if (!heroListings.length) {
      return [
        { label: "Verified units", value: "—", icon: ShieldCheck },
        { label: "Avg commute", value: "—", icon: MapPin },
        { label: "Under stipend", value: "—", icon: Gauge },
        { label: "Safety avg", value: "—", icon: Sparkles },
      ];
    }

    const verified = heroListings.filter((listing) => listing.safetyScore >= 90).length;
    const avgCommute =
      heroListings.reduce((total, listing) => total + listing.commuteMinutesNight, 0) / heroListings.length;
    const stipendFriendly = contract
      ? heroListings.filter((listing) => listing.weeklyPrice <= contract.weeklyStipend).length
      : heroListings.length;
    const avgSafety =
      heroListings.reduce((total, listing) => total + listing.safetyScore, 0) / heroListings.length;

    return [
      { label: "Verified units", value: `${verified}+`, icon: ShieldCheck },
      { label: "Avg commute", value: `${Math.round(avgCommute)} min`, icon: MapPin },
      { label: "Under stipend", value: `${stipendFriendly}/${heroListings.length}`, icon: Gauge },
      { label: "Safety avg", value: `${Math.round(avgSafety)}/100`, icon: Sparkles },
    ];
  }, [contract, heroListings]);

  const filters = [
    { label: "Verified safety", value: "verified" },
    { label: "Pet friendly", value: "pets" },
    { label: "Private entrance", value: "private" },
    { label: "Desk workspace", value: "workspace" },
    { label: "Parking included", value: "parking" },
  ];

  const filteredListings = useMemo(() => {
    if (!heroListings.length) return [];
    switch (activeFilter) {
      case "verified":
        return heroListings.filter((listing) => listing.safetyScore >= 90);
      case "pets":
        return heroListings.filter((listing) => listing.petPolicy !== "none");
      case "private":
        return heroListings.filter((listing) => listing.amenities.includes("Private Entrance"));
      case "workspace":
        return heroListings.filter((listing) => listing.amenities.some((a) => /desk|workspace/i.test(a)));
      case "parking":
        return heroListings.filter((listing) => listing.parking !== "none");
      default:
        return heroListings;
    }
  }, [activeFilter, heroListings]);

  const listingsToShow = filteredListings.length ? filteredListings : heroListings;

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[44px] border border-[var(--nh-border)] bg-gradient-to-br from-white via-[#fff5f7] to-[#f3f7ff] px-8 py-10 shadow-[0_40px_80px_rgba(34,34,34,0.12)]">
        <div className="absolute -top-32 right-0 h-64 w-64 rounded-full bg-[var(--nh-accent-soft)] blur-3xl" />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)] shadow-[var(--nh-shadow-soft)]">
              <BadgeCheck className="h-3.5 w-3.5 text-[var(--nh-accent)]" />
              Nurse concierge mode
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--nh-text-primary)] sm:text-5xl">
              {contract?.hospital ? `Stays near ${contract.hospital}` : "Find your next assignment home"}
            </h1>
            <p className="max-w-lg text-sm text-[var(--nh-text-secondary)]">
              Curated, vetted rentals that keep you within a {commuteLimit}-minute commute window and protect your stipend and safety expectations. Swipe to shortlist or hold in a single tap.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/swipe" className="btn btn-primary">
                Continue swiping <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/nurse/contract" className="btn btn-outline">
                Update contract guardrails
              </Link>
            </div>
            {contract && (
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--nh-border)] bg-white/80 px-4 py-2 text-xs font-medium text-[var(--nh-text-secondary)] shadow-[var(--nh-shadow-soft)]">
                <MapPin className="h-3.5 w-3.5 text-[var(--nh-accent)]" />
                Starts {new Date(contract.startDate).toLocaleDateString()} • Stipend ${contract.weeklyStipend.toLocaleString()}/wk
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {stats.map((stat) => (
              <HeroStat key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
              Explore stays curated for you
            </p>
            <h2 className="text-2xl font-semibold text-[var(--nh-text-primary)]">
              Top picks {contract?.hospital ? `near ${contract.hospital}` : "for travel nurses"}
            </h2>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full border border-[var(--nh-border)] bg-white p-1 shadow-[var(--nh-shadow-soft)]">
            <ToggleButton icon={LayoutGrid} label="List" active={view === "grid"} onClick={() => setView("grid")} />
            <ToggleButton icon={MapIcon} label="Map" active={view === "map"} onClick={() => setView("map")} />
          </div>
        </header>

        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                  isActive
                    ? "border-[var(--nh-accent)] bg-[var(--nh-accent-soft)] text-[var(--nh-accent)]"
                    : "border-[var(--nh-border)] text-[var(--nh-text-secondary)] hover:border-[var(--nh-border-strong)] hover:text-[var(--nh-text-primary)]",
                ].join(" ")}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-[32px] border border-[var(--nh-border)] bg-white/90 p-6 shadow-[var(--nh-shadow-soft)]">
          {view === "map" ? (
            <ListingMap listings={mapListings} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {listingsToShow.map((listing) => (
                <ListingExploreCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">Shortlist</p>
            <h2 className="text-xl font-semibold text-[var(--nh-text-primary)]">
              {shortlistCount > 0 ? "Compare your top contenders" : "Start your shortlist"}
            </h2>
          </div>
          <Link to="/shortlist" className="text-sm font-semibold text-[var(--nh-accent)] hover:underline">
            View shortlist
          </Link>
        </div>
        <ShortlistBoard />
      </section>
    </div>
  );
}

function HeroStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[var(--nh-border)] bg-white/80 p-5 shadow-[var(--nh-shadow-soft)]">
      <Icon className="h-5 w-5 text-[var(--nh-accent)]" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[var(--nh-text-primary)]">{value}</p>
    </div>
  );
}

function ToggleButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
        active
          ? "bg-[var(--nh-accent)] text-white shadow-[var(--nh-shadow-soft)]"
          : "text-[var(--nh-text-secondary)] hover:bg-[var(--nh-surface-muted)] hover:text-[var(--nh-text-primary)]",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function OwnerDashboard() {
  const listings = useAppStore((state) => state.listings);

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-[var(--nh-border)] bg-white/90 p-8 shadow-[var(--nh-shadow-soft)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">Owner summary</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--nh-text-primary)]">Signal from nurse marketplace</h1>
        <p className="mt-4 text-sm text-[var(--nh-text-secondary)]">
          Track matches, quick holds, and boost performance across your furnished portfolio.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-xs text-[var(--nh-text-secondary)]">
          <span className="rounded-full border border-[var(--nh-border)] px-4 py-2 font-semibold text-[var(--nh-text-primary)]">
            48 hr response SLA
          </span>
          <span className="rounded-full border border-[var(--nh-border)] px-4 py-2 font-semibold text-[var(--nh-text-primary)]">
            Verified badges featured
          </span>
        </div>
      </section>
      <ListingTable listings={listings} />
    </div>
  );
}

function AdminDashboard() {
  const listings = useAppStore((state) => state.listings);

  return (
    <div className="space-y-8">
      <AdminOverview />
      <section className="space-y-4">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">Current metro</p>
          <h2 className="text-lg font-semibold text-[var(--nh-text-primary)]">San Francisco Bay Area deployment</h2>
        </header>
        <ListingTable listings={listings} />
      </section>
    </div>
  );
}
