import { Pencil, ShieldCheck, Timer } from "lucide-react";
import { useAppStore } from "../../stores/useAppStore";
import type { Listing } from "../../types";

interface ListingTableProps {
  listings: Listing[];
  onEdit?: (listing: Listing) => void;
}

export default function ListingTable({ listings, onEdit }: ListingTableProps) {
  const matches = useAppStore((state) => state.matches);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-lg shadow-slate-900/5">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Listing</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Weekly</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Commute</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Matches</th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {listings.map((listing) => {
            const activeMatches = matches.filter((match) => match.listingId === listing.id);

            return (
              <tr key={listing.id} className="hover:bg-slate-50/60">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-100">
                      <img
                        src={listing.heroImage}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{listing.title}</p>
                      <p className="text-xs text-slate-500">
                        {listing.city}, {listing.state}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-900">${listing.weeklyPrice}</td>
                <td className="px-6 py-4 text-xs text-slate-500">
                  {listing.commuteMinutesPeak} min peak • {listing.commuteMinutesNight} min night
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={listing.status} />
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {activeMatches.length} match{activeMatches.length === 1 ? "" : "es"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(listing)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: Listing["status"] }) {
  const copy: Record<Listing["status"], { label: string; tone: string }> = {
    active: { label: "Active", tone: "bg-sky-50 text-sky-700 border-sky-200" },
    draft: { label: "Draft", tone: "bg-slate-50 text-slate-600 border-slate-200" },
    snoozed: { label: "Snoozed", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${copy[status].tone}`}
    >
      <Timer className="h-3.5 w-3.5" />
      {copy[status].label}
    </span>
  );
}
