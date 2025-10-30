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
    <section className="grid gap-5 rounded-[36px] border border-[var(--nh-border)] bg-white/95 p-6 shadow-[var(--nh-shadow-soft)] sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metricIcons[metric.key as keyof typeof metricIcons];
        return (
          <div key={metric.key} className="rounded-[28px] border border-[var(--nh-border)] bg-white p-5 shadow-[var(--nh-shadow-soft)]">
            <div className="flex items-center justify-between text-xs text-[var(--nh-text-secondary)]">
              <Icon className="h-6 w-6 text-[var(--nh-accent)]" />
              <span className="uppercase tracking-[0.18em]">{metric.helper}</span>
            </div>
            <p className="mt-4 text-2xl font-semibold text-[var(--nh-text-primary)]">{metric.value}</p>
            <p className="text-xs text-[var(--nh-text-secondary)]">{metric.label}</p>
          </div>
        );
      })}
    </section>
  );
}
