import { Heart, PawPrint, ShieldCheck, Star, Timer, TrainFront } from "lucide-react";
import { calculateMatchScore } from "../../lib/scoring";
import type { Contract, Listing, NursePreferences } from "../../types";

interface SwipeCardProps {
  listing: Listing;
  contract?: Contract;
  preferences?: NursePreferences;
  onLike: () => void;
  onPass: () => void;
  onShortlist: () => void;
}

export default function SwipeCard({ listing, contract, preferences, onLike, onPass, onShortlist }: SwipeCardProps) {
  const breakdown = contract && preferences ? calculateMatchScore(contract, listing, preferences) : undefined;

  return (
    <article className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-900/5">
      <div className="relative h-64 w-full overflow-hidden sm:h-80">
        <img
          src={listing.heroImage}
          alt={listing.title}
          className="h-full w-full object-cover transition duration-500"
        />
        {listing.videoUrl && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-zinc-900 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            Video tour available
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{listing.title}</h2>
              <p className="text-sm text-zinc-200">
                {listing.city}, {listing.state} • {listing.bedrooms}bd / {listing.bathrooms}ba
              </p>
            </div>
            <div className="rounded-2xl bg-white/20 px-4 py-2 text-right">
              <p className="text-xs uppercase tracking-wide text-zinc-200">Weekly</p>
              <p className="text-lg font-semibold">${listing.weeklyPrice}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 sm:grid-cols-[2fr,1fr] sm:gap-8 sm:px-8">
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">{listing.description}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            {listing.amenities.slice(0, 6).map((item) => (
              <span
                key={item}
                className="rounded-full border border-zinc-200 px-3 py-1 font-medium text-zinc-700"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="grid gap-3 text-sm">
            <DetailRow
              icon={TrainFront}
              label="Commute"
              value={`${listing.commuteMinutesPeak} min peak • ${listing.commuteMinutesNight} min night`}
            />
            <DetailRow icon={ShieldCheck} label="Safety score" value={`${listing.safetyScore}/100`} />
            <DetailRow
              icon={PawPrint}
              label="Pet policy"
              value={listing.petPolicy === "allowed" ? "All pets" : listing.petPolicy}
            />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Match breakdown</p>
            <div className="mt-3 space-y-3">
              <ScorePill label="Fit to stipend" score={breakdown?.stipendFit ?? listing.stipendFitScore} />
              <ScorePill label="Commute guardrail" score={breakdown?.commute ?? listing.totalScore} />
              <ScorePill label="Safety" score={breakdown?.safety ?? listing.safetyScore} />
              <ScorePill label="Quality" score={breakdown?.quality ?? listing.qualityScore} />
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-inner shadow-zinc-200/80">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">Quick hold</p>
            <p className="mt-1 text-sm text-zinc-600">
              Reserve for 24 hours with a fully refundable $100 intent hold while we verify ID.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-200 bg-zinc-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <Timer className="h-4 w-4 text-teal-600" />
          Decision feedback shared instantly with owner
        </div>
        <div className="flex items-center gap-3">
          <ActionButton variant="ghost" label="Pass" icon={Star} onClick={onPass} />
          <ActionButton variant="secondary" label="Shortlist" icon={ShieldCheck} onClick={onShortlist} />
          <ActionButton variant="primary" label="Match" icon={Heart} onClick={onLike} />
        </div>
      </div>
    </article>
  );
}

interface DetailRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function DetailRow({ icon: Icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm">
      <Icon className="h-4 w-4 text-teal-600" />
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
        <p className="text-sm font-medium text-zinc-800">{value}</p>
      </div>
    </div>
  );
}

interface ScorePillProps {
  label: string;
  score: number;
}

function ScorePill({ label, score }: ScorePillProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-full bg-white px-4 py-2 shadow-sm">
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      <span className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
        <ShieldCheck className="h-4 w-4 text-teal-600" />
        {Math.round(score)}
      </span>
    </div>
  );
}

interface ActionButtonProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant: "primary" | "secondary" | "ghost";
}

function ActionButton({ label, icon: Icon, onClick, variant }: ActionButtonProps) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2";
  const classes =
    variant === "primary"
      ? "bg-teal-600 text-white hover:bg-teal-500 focus:ring-teal-500"
      : variant === "secondary"
        ? "border border-teal-200 bg-white text-teal-600 hover:border-teal-300 hover:text-teal-700 focus:ring-teal-500"
        : "border border-transparent text-zinc-500 hover:text-zinc-900 focus:ring-zinc-500";

  return (
    <button
      type="button"
      className={[base, classes].join(" ")}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

