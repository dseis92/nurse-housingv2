import { Suspense, useMemo, useState, lazy } from "react";
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
import ListingExploreCard from "../components/listings/ListingExploreCard";
const ListingMap = lazy(() => import("../components/map/ListingMap"));

type SortKey = "match" | "priceLowHigh" | "priceHighLow" | "commute";
type DatePreset = { label: string; nights: number };

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
  const [sort, setSort] = useState<SortKey>("match");
  const [searchDestination, setSearchDestination] = useState(contract?.hospital ?? "");
  const [recentSearches, setRecentSearches] = useState<string[]>(["Seattle", "San Diego", "Austin"]);
  const [guestCount, setGuestCount] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState<DatePreset | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([800, 2400]);
  const [activeListingId, setActiveListingId] = useState<string | null>(null);

  const commuteLimit = nurseProfile?.preferences.commute.maxMinutes ?? 30;

  const heroListings = useMemo(() => listings.slice(0, 12), [listings]);

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

  const popularDestinations = [
    {
      city: "Seattle",
      state: "WA",
      hero: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=800&q=60",
    },
    {
      city: "San Diego",
      state: "CA",
      hero: "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?auto=format&fit=crop&w=800&q=60",
    },
    {
      city: "Austin",
      state: "TX",
      hero: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=60",
    },
    {
      city: "Denver",
      state: "CO",
      hero: "https://images.unsplash.com/photo-1519861155734-0a5f0b02b27e?auto=format&fit=crop&w=800&q=60",
    },
  ];

  const datePresets: DatePreset[] = [
    { label: "1 week", nights: 7 },
    { label: "2 weeks", nights: 14 },
    { label: "4 weeks", nights: 28 },
  ];

  const handleSearch = () => {
    if (!searchDestination.trim()) return;
    setRecentSearches((prev) => {
      const normalized = searchDestination.trim();
      const next = [normalized, ...prev.filter((item) => item.toLowerCase() !== normalized.toLowerCase())];
      return next.slice(0, 4);
    });
  };

  const filteredListings = useMemo(() => {
    if (!heroListings.length) return [];

    const destinationLower = searchDestination.trim().toLowerCase();

    let results = heroListings.filter((listing) => {
      const meetsPrice =
        listing.weeklyPrice >= priceRange[0] && listing.weeklyPrice <= priceRange[1];
      const matchesDestination = destinationLower
        ? [listing.city, listing.state, listing.neighborhood]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(destinationLower)
        : true;
      return meetsPrice && matchesDestination;
    });

    switch (activeFilter) {
      case "verified":
        results = results.filter((listing) => listing.safetyScore >= 90);
        break;
      case "pets":
        results = results.filter((listing) => listing.petPolicy !== "none");
        break;
      case "private":
        results = results.filter((listing) => listing.amenities.includes("Private Entrance"));
        break;
      case "workspace":
        results = results.filter((listing) => listing.amenities.some((a) => /desk|workspace/i.test(a)));
        break;
      case "parking":
        results = results.filter((listing) => listing.parking !== "none");
        break;
      default:
        break;
    }

    switch (sort) {
      case "priceLowHigh":
        return [...results].sort((a, b) => a.weeklyPrice - b.weeklyPrice);
      case "priceHighLow":
        return [...results].sort((a, b) => b.weeklyPrice - a.weeklyPrice);
      case "commute":
        return [...results].sort((a, b) => a.commuteMinutesNight - b.commuteMinutesNight);
      default:
        return results;
    }
  }, [activeFilter, heroListings, priceRange, searchDestination, sort]);

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
        <div className="rounded-[40px] border border-[var(--nh-border)] bg-white/95 p-6 shadow-[var(--nh-shadow-soft)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1 space-y-4">
              <div className="grid gap-4 md:grid-cols-[repeat(3,minmax(0,1fr))]">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
                    Where
                  </label>
                  <input
                    value={searchDestination}
                    onChange={(event) => setSearchDestination(event.target.value)}
                    placeholder="City, neighborhood, or hospital"
                    className="form-input"
                  />
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSearchDestination(item)}
                        className="rounded-full border border-[var(--nh-border)] px-3 py-1 text-xs text-[var(--nh-text-secondary)] hover:border-[var(--nh-border-strong)] hover:text-[var(--nh-text-primary)]"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
                    When
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {datePresets.map((preset) => {
                      const active = selectedPreset?.nights === preset.nights;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setSelectedPreset(preset)}
                          className={[
                            "rounded-full border px-3 py-2 text-xs font-semibold transition",
                            active
                              ? "border-[var(--nh-accent)] bg-[var(--nh-accent-soft)] text-[var(--nh-accent)]"
                              : "border-[var(--nh-border)] text-[var(--nh-text-secondary)] hover:border-[var(--nh-border-strong)] hover:text-[var(--nh-text-primary)]",
                          ].join(" ")}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
                    Who
                  </label>
                  <div className="flex items-center gap-3 rounded-full border border-[var(--nh-border)] bg-[var(--nh-surface-muted)] px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setGuestCount((prev) => Math.max(1, prev - 1))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--nh-border)] text-sm font-semibold text-[var(--nh-text-secondary)]"
                    >
                      –
                    </button>
                    <span className="min-w-[3ch] text-center text-sm font-semibold text-[var(--nh-text-primary)]">
                      {guestCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGuestCount((prev) => prev + 1)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--nh-accent)] bg-[var(--nh-accent-soft)] text-sm font-semibold text-[var(--nh-accent)]"
                    >
                      +
                    </button>
                    <span className="text-xs text-[var(--nh-text-secondary)]">guests</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
                  Weekly stipend range
                </label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="range"
                    min={600}
                    max={3000}
                    value={priceRange[0]}
                    onChange={(event) =>
                      setPriceRange(([_, max]) => [Number(event.target.value), Math.max(Number(event.target.value), max)])
                    }
                    className="w-full"
                  />
                  <input
                    type="range"
                    min={800}
                    max={3500}
                    value={priceRange[1]}
                    onChange={(event) =>
                      setPriceRange(([min]) => [Math.min(min, Number(event.target.value)), Number(event.target.value)])
                    }
                    className="w-full"
                  />
                  <span className="text-xs font-semibold text-[var(--nh-text-primary)]">
                    ${priceRange[0]} – ${priceRange[1]}
                  </span>
                </div>
              </div>
            </div>

            <button type="button" onClick={handleSearch} className="btn btn-primary px-6 py-3">
              Search stays
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <header className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
              Popular destinations
            </h3>
            <button
              type="button"
              className="text-xs font-semibold text-[var(--nh-accent)] hover:underline"
              onClick={() => {
                setSearchDestination("");
                setActiveFilter("verified");
                setSort("match");
              }}
            >
              Reset filters
            </button>
          </header>
          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
            {popularDestinations.map((destination) => (
              <button
                key={destination.city}
                type="button"
                onClick={() => setSearchDestination(destination.city)}
                className="group relative h-36 min-w-[200px] overflow-hidden rounded-3xl bg-[var(--nh-surface-muted)]"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition group-hover:scale-[1.05]" />
                <img
                  src={destination.hero}
                  alt={`${destination.city}, ${destination.state}`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                />
                <span className="absolute left-4 bottom-4 text-sm font-semibold text-white">
                  {destination.city}, {destination.state}
                </span>
              </button>
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
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1 rounded-full border border-[var(--nh-border)] bg-white p-1 shadow-[var(--nh-shadow-soft)]">
              <ToggleButton icon={LayoutGrid} label="List" active={view === "grid"} onClick={() => setView("grid")} />
              <ToggleButton icon={MapIcon} label="Map" active={view === "map"} onClick={() => setView("map")} />
            </div>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="rounded-full border border-[var(--nh-border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--nh-text-secondary)]"
            >
              <option value="match">Best match</option>
              <option value="priceLowHigh">Price: Low to high</option>
              <option value="priceHighLow">Price: High to low</option>
              <option value="commute">Commute time</option>
            </select>
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
            <Suspense
              fallback={
                <div className="grid h-[420px] place-items-center text-sm text-[var(--nh-text-secondary)]">
                  Loading map…
                </div>
              }
            >
              <ListingMap
                listings={mapListings}
                activeListingId={activeListingId}
                onSelect={(id) => {
                  setActiveListingId(id);
                  setView("grid");
                  const element = document.getElementById(`listing-${id}`);
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
              />
            </Suspense>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {listingsToShow.map((listing) => (
                <div key={listing.id} id={`listing-${listing.id}`}>
                  <ListingExploreCard
                    listing={listing}
                    onHover={(id) => setActiveListingId(id)}
                    onLeave={() => setActiveListingId(null)}
                    onSelect={(id) => setActiveListingId(id)}
                  />
                </div>
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
