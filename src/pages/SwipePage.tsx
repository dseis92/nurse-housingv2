import { Gauge, Map, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import DeckLocal from "../components/swipe/DeckLocal";
import ListingMap from "../components/map/ListingMap";
import { useAppStore } from "../stores/useAppStore";

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
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-900/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-sky-600">Swipe-first marketplace</p>
            <h1 className="text-2xl font-semibold text-slate-900">Match faster with curated guardrails</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Each card is pre-filtered for your stipend, commute limits, safety expectations, and pet policy. Match to open
              chat or shortlist to compare later.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-sky-700">
              <Sparkles className="h-3.5 w-3.5 text-sky-600" />
              Smart scoring on
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-sky-700">
              <Gauge className="h-3.5 w-3.5 text-sky-600" />
              Commute guardrail
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-sky-700">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-600" />
              Safety verified
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowMap((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-sky-200 hover:text-slate-900"
          >
            <Map className="h-3.5 w-3.5 text-sky-600" />
            {showMap ? "Hide map" : "Show map"}
          </button>
        </div>
      </section>

      {showMap && (
        <section>
          <ListingMap listings={mapListings} />
        </section>
      )}

      <DeckLocal />
    </div>
  );
}
