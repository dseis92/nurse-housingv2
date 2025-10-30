import { Gauge, Map, ShieldCheck, Sparkles } from "lucide-react";
import { Suspense, useMemo, useState, lazy } from "react";
import { useAppStore } from "../stores/useAppStore";

const SwipeDeck = lazy(() => import("../components/swipe/DeckLocal"));
const ListingMap = lazy(() => import("../components/map/ListingMap"));

export default function SwipePage() {
  const [showMap, setShowMap] = useState(false);
  const listings = useAppStore((state) => state.listings);

  const mapListings = useMemo(() => {
    return listings
      .filter((listing) => typeof listing.lat === "number" && typeof listing.lng === "number")
      .map((listing) => ({
        id: listing.id,
        title: listing.title,
        lat: listing.lat,
        lng: listing.lng,
        nightlyPrice: listing.weeklyPrice ? Math.round(listing.weeklyPrice / 7) : undefined,
      }));
  }, [listings]);

  return (
    <div className="space-y-10">
      <section className="rounded-[36px] border border-[var(--nh-border)] bg-white/95 p-8 shadow-[var(--nh-shadow-soft)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
              Swipe-first marketplace
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--nh-text-primary)]">
              Match faster with curated guardrails
            </h1>
            <p className="mt-3 max-w-xl text-sm text-[var(--nh-text-secondary)]">
              Each card is pre-filtered for your stipend, commute limits, safety expectations, and pet policy. Match to open
              chat or shortlist to compare later.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--nh-text-secondary)]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--nh-accent-soft)] px-3 py-1 text-[var(--nh-accent)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--nh-accent)]" />
              Smart scoring on
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--nh-surface-muted)] px-3 py-1 text-[var(--nh-text-secondary)]">
              <Gauge className="h-3.5 w-3.5 text-[var(--nh-accent)]" />
              Commute guardrail
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--nh-surface-muted)] px-3 py-1 text-[var(--nh-text-secondary)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--nh-accent)]" />
              Safety verified
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowMap((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--nh-border)] px-4 py-2 text-xs font-semibold text-[var(--nh-text-secondary)] transition hover:border-[var(--nh-border-strong)] hover:text-[var(--nh-text-primary)]"
          >
            <Map className="h-3.5 w-3.5 text-[var(--nh-accent)]" />
            {showMap ? "Hide map" : "Show map"}
          </button>
        </div>
      </section>

      {showMap && (
        <section>
          <Suspense
            fallback={
              <div className="grid h-[420px] place-items-center rounded-[36px] border border-[var(--nh-border)] bg-white/90 text-sm text-[var(--nh-text-secondary)] shadow-[var(--nh-shadow-soft)]">
                Loading map…
              </div>
            }
          >
            <ListingMap listings={mapListings} />
          </Suspense>
        </section>
      )}

      <Suspense
        fallback={
          <div className="grid h-[640px] place-items-center rounded-[36px] border border-[var(--nh-border)] bg-white/95 text-sm text-[var(--nh-text-secondary)] shadow-[var(--nh-shadow-soft)]">
            Loading swipe deck…
          </div>
        }
      >
        <SwipeDeck />
      </Suspense>
    </div>
  );
}
