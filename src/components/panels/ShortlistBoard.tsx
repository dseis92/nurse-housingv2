import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useAppStore } from "../../stores/useAppStore";
import type { ShortlistEntry } from "../../stores/useAppStore";
import type { Listing } from "../../types";
import LottieAnimation from "../ui/LottieAnimation";

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
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/90 p-10 text-center text-sm text-slate-500">
        <div className="mx-auto mb-6 h-40 w-40">
          <LottieAnimation animation="levelUpBadge" loop />
        </div>
        Shortlist your top contenders to compare guardrails side-by-side before requesting a hold.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white/95 shadow-lg shadow-slate-900/5">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-slate-50/60">
          <tr>
            <HeaderCell label="Listing" />
            <HeaderCell label="Weekly" />
            <HeaderCell label="Commute" />
            <HeaderCell label="Safety" />
            <HeaderCell label="Notes" />
            <th className="px-6 py-4" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {shortlist.map(({ entry, listing }) => (
            <tr key={entry.id} className="hover:bg-slate-50/60">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-16 overflow-hidden rounded-xl bg-slate-100">
                    <img
                      src={listing.heroImage}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{listing.title}</p>
                    <p className="text-xs text-slate-500">
                      {listing.city}, {listing.state} • {listing.bedrooms}bd/{listing.bathrooms}ba
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-slate-900">${listing.weeklyPrice}</td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {listing.commuteMinutesPeak} min peak • {listing.commuteMinutesNight} min night
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                  Score {listing.safetyScore}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-slate-500">{entry.notes ?? "Tap to add field notes"}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    to={`/listing/${listing.id}`}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-500"
                  >
                    View details
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFromShortlist(entry.id)}
                    className="rounded-full border border-slate-200 p-1 text-slate-400 transition hover:border-slate-300 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HeaderCell({ label }: { label: string }) {
  return (
    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </th>
  );
}
