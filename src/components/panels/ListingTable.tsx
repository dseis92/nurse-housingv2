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
    <div className="overflow-hidden rounded-[36px] border border-[var(--nh-border)] bg-white/95 shadow-[var(--nh-shadow-soft)]">
      <table className="min-w-full divide-y divide-[var(--nh-border)] text-sm">
        <thead>
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
              Listing
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
              Weekly
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
              Commute
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
              Matches
            </th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--nh-border)] bg-white">
          {listings.map((listing) => {
            const activeMatches = matches.filter((match) => match.listingId === listing.id);

            return (
              <tr key={listing.id} className="hover:bg-[var(--nh-surface-muted)]/70">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-2xl bg-[var(--nh-surface-muted)]">
                      <img
                        src={listing.heroImage}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--nh-text-primary)]">{listing.title}</p>
                      <p className="text-xs text-[var(--nh-text-secondary)]">
                        {listing.city}, {listing.state}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-[var(--nh-text-primary)]">
                  ${listing.weeklyPrice.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-xs text-[var(--nh-text-secondary)]">
                  {listing.commuteMinutesPeak} min peak • {listing.commuteMinutesNight} min night
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={listing.status} />
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[var(--nh-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--nh-accent)]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {activeMatches.length} match{activeMatches.length === 1 ? "" : "es"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(listing)}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--nh-border)] px-3 py-1.5 text-xs font-semibold text-[var(--nh-text-secondary)] transition hover:border-[var(--nh-border-strong)] hover:text-[var(--nh-text-primary)]"
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
    active: { label: "Active", tone: "bg-[var(--nh-accent-soft)] text-[var(--nh-accent)] border-[var(--nh-accent)]/20" },
    draft: { label: "Draft", tone: "bg-[var(--nh-surface-muted)] text-[var(--nh-text-secondary)] border-[var(--nh-border)]" },
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
