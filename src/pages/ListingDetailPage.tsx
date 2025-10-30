import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, ShieldCheck } from "lucide-react";
import { calculateMatchScore } from "../lib/scoring";
import {
  selectActiveContract,
  selectCurrentNurseProfile,
  selectListingById,
  useAppStore,
} from "../stores/useAppStore";

export default function ListingDetailPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const listing = useAppStore(selectListingById(listingId ?? ""));
  const contract = useAppStore(selectActiveContract);
  const nurseProfile = useAppStore(selectCurrentNurseProfile);
  const addToShortlist = useAppStore((state) => state.actions.addToShortlist);

  const breakdown = useMemo(() => {
    if (!listing || !contract || !nurseProfile) return undefined;
    return calculateMatchScore(contract, listing, nurseProfile.preferences);
  }, [listing, contract, nurseProfile]);

  if (!listing) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        Listing not found. This unit may have been removed or snoozed.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to shortlist
      </button>

      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-xl shadow-slate-900/8">
        <div className="grid gap-6 p-6 lg:grid-cols-[3fr,2fr] lg:p-10">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <img
                src={listing.heroImage}
                alt={listing.title}
                className="h-72 w-full object-cover"
              />
            </div>
            <header>
              <p className="text-xs uppercase tracking-wide text-sky-600">{listing.neighborhood ?? listing.city}</p>
              <h1 className="text-3xl font-semibold text-slate-900">{listing.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold">
                  {listing.bedrooms} bd • {listing.bathrooms} ba
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold">
                  {listing.parking} parking
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold">
                  <Clock className="h-3.5 w-3.5 text-sky-600" />
                  {listing.minStayWeeks} week min stay
                </span>
              </div>
            </header>

            <p className="text-sm leading-relaxed text-slate-600">{listing.description}</p>

            <section>
              <h2 className="text-sm font-semibold text-slate-900">Amenities &amp; safety</h2>
              <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                {listing.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-sky-600" />
                    {amenity}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Pricing</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">${listing.weeklyPrice}</p>
              <p className="text-xs text-slate-500">Weekly stipend comparison</p>
              {breakdown && (
                <div className="mt-4 grid gap-2 text-xs text-slate-500">
                  <ScoreRow label="Stipend fit" value={`${Math.round(breakdown.stipendFit)}%`} />
                  <ScoreRow label="Commute guardrail" value={`${Math.round(breakdown.commute)}%`} />
                  <ScoreRow label="Safety" value={`${Math.round(breakdown.safety)}%`} />
                  <ScoreRow label="Quality" value={`${Math.round(breakdown.quality)}%`} />
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Commute notes</h2>
              <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-sky-600" />
                {listing.commuteNotes ?? "Direct surface streets, no bridge crossings."}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Peak {listing.commuteMinutesPeak} min • Night {listing.commuteMinutesNight} min
              </p>
            </div>

            <button
              type="button"
              onClick={() => addToShortlist(listing.id)}
              className="btn btn-primary w-full justify-center gap-2 px-6 py-3"
            >
              Add to shortlist
            </button>
          </aside>
        </div>
      </article>
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-full bg-slate-50 px-3 py-2">
      <span>{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}
