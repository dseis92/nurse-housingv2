import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useAppStore } from "../../stores/useAppStore";
import type { ShortlistEntry } from "../../stores/useAppStore";
import type { Listing } from "../../types";

export default function ShortlistBoard() {
  const shortlist = useAppStore((state) =>
    state.shortlist
      .map((entry) => ({
        entry,
        listing: state.listings.find((listing) => listing.id === entry.listingId),
      }))
      .filter((item): item is { entry: ShortlistEntry; listing: Listing } => Boolean(item.listing))
  );
  const removeFromShortlist = useAppStore((state) => state.actions.removeFromShortlist);

  if (shortlist.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500">
        Shortlist your top contenders to compare guardrails side-by-side before requesting a hold.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-zinc-100 text-sm">
        <thead>
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Listing
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Weekly
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Commute
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Safety
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Notes
            </th>
            <th className="px-6 py-4" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {shortlist.map(({ entry, listing }) => {
            if (!listing) return null;

            return (
              <tr key={entry.id} className="hover:bg-zinc-50/60">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-16 overflow-hidden rounded-xl bg-zinc-100">
                      <img
                        src={listing.heroImage}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900">{listing.title}</p>
                      <p className="text-xs text-zinc-500">
                        {listing.city}, {listing.state} • {listing.bedrooms}bd/{listing.bathrooms}ba
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-zinc-900">${listing.weeklyPrice}</td>
                <td className="px-6 py-4 text-sm text-zinc-700">
                  {listing.commuteMinutesPeak} min peak • {listing.commuteMinutesNight} min night
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                    Score {listing.safetyScore}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-zinc-500">
                  {entry.notes ?? "Tap to add field notes"}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      to={`/listing/${listing.id}`}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-500"
                    >
                      View details
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeFromShortlist(entry.id)}
                      className="rounded-full border border-zinc-200 p-1 text-zinc-400 transition hover:border-zinc-300 hover:text-zinc-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
