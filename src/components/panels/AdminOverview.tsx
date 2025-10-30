import { CircleDollarSign, Compass, ShieldCheck, Users } from "lucide-react";
import { calculateMatchScore } from "../../lib/scoring";
import { selectActiveContract, useAppStore } from "../../stores/useAppStore";

const metricIcons = {
  matches: ShieldCheck,
  listings: Compass,
  nurses: Users,
  revenue: CircleDollarSign,
} as const;

export default function AdminOverview() {
  const listings = useAppStore((state) => state.listings);
  const matches = useAppStore((state) => state.matches);
  const nurseProfiles = useAppStore((state) => state.nurseProfiles);
  const contract = useAppStore(selectActiveContract);
  const shortlist = useAppStore((state) => state.shortlist);

  const avgScore = (() => {
    if (!contract || listings.length === 0 || nurseProfiles.length === 0) return 0;
    const preferences = nurseProfiles[0].preferences;
    const total = listings
      .map((listing) => calculateMatchScore(contract, listing, preferences).total)
      .reduce((sum, score) => sum + score, 0);
    return Math.round(total / listings.length);
  })();

  const metrics = [
    {
      key: "matches",
      label: "Active matches",
      value: matches.length,
      helper: `${shortlist.length} on shortlist`,
    },
    {
      key: "listings",
      label: "Live listings",
      value: listings.length,
      helper: `${avgScore}% avg fit score`,
    },
    {
      key: "nurses",
      label: "Nurse profiles",
      value: nurseProfiles.length,
      helper: "Verified via employer",
    },
    {
      key: "revenue",
      label: "Projected revenue",
      value: "$18.6K",
      helper: "Next 90 days",
    },
  ] as const;

  return (
    <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg shadow-slate-900/5 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metricIcons[metric.key as keyof typeof metricIcons];
        return (
          <div key={metric.key} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <Icon className="h-6 w-6 text-sky-600" />
              <span className="text-[10px] uppercase tracking-wide text-slate-400">{metric.helper}</span>
            </div>
            <p className="mt-4 text-2xl font-semibold text-slate-900">{metric.value}</p>
            <p className="text-xs text-slate-500">{metric.label}</p>
          </div>
        );
      })}
    </section>
  );
}
