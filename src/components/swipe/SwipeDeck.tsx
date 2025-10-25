import { useMemo } from "react";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import SwipeCard from "./SwipeCard";
import {
  selectActiveContract,
  selectCurrentNurseProfile,
  selectSwipeListings,
  useAppStore,
} from "../../stores/useAppStore";

export default function SwipeDeck() {
  const listings = useAppStore(selectSwipeListings);
  const contract = useAppStore(selectActiveContract);
  const nurseProfile = useAppStore(selectCurrentNurseProfile);
  const { likeListing, passListing, addToShortlist, refreshSwipeQueue } = useAppStore((state) => state.actions);

  const activeListing = listings[0];

  const queueMeta = useMemo(
    () => ({
      total: listings.length,
      hasListings: listings.length > 0,
    }),
    [listings]
  );

  if (!contract || !nurseProfile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-zinc-200 bg-white text-center">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-teal-600" />
        <p className="text-lg font-semibold text-zinc-900">Set up a contract to build your swipe queue</p>
        <p className="mt-2 max-w-md text-sm text-zinc-500">
          Once you complete your assignment intake, we will score vetted rentals against your guardrails.
        </p>
      </div>
    );
  }

  if (!queueMeta.hasListings) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white text-center">
        <Sparkles className="mb-4 h-10 w-10 text-teal-600" />
        <p className="text-lg font-semibold text-zinc-900">You&apos;re caught up!</p>
        <p className="mt-2 max-w-md text-sm text-zinc-500">
          The ops team is curating more matches based on your safety guardrails and commute filters.
        </p>
        <button
          type="button"
          onClick={refreshSwipeQueue}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-semibold text-zinc-700 shadow-sm hover:border-zinc-300 hover:text-zinc-900"
        >
          <RefreshCw className="h-4 w-4" />
          Reload matches
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Swipe queue</p>
          <h1 className="text-xl font-semibold text-zinc-900">
            {queueMeta.total} match
            {queueMeta.total === 1 ? "" : "es"} ready
          </h1>
        </div>
        <p className="text-xs text-zinc-500">Guardrails: commute ≤ {nurseProfile.preferences.commute.maxMinutes} min</p>
      </div>

      {activeListing && (
        <SwipeCard
          listing={activeListing}
          contract={contract}
          preferences={nurseProfile.preferences}
          onLike={() => likeListing(activeListing.id)}
          onPass={() => passListing(activeListing.id)}
          onShortlist={() => addToShortlist(activeListing.id)}
        />
      )}
    </div>
  );
}

