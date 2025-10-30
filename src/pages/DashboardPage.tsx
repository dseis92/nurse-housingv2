import { Link } from "react-router-dom";
import { ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import AdminOverview from "../components/panels/AdminOverview";
import ListingTable from "../components/panels/ListingTable";
import ShortlistBoard from "../components/panels/ShortlistBoard";
import { selectActiveContract, selectCurrentNurseProfile, useAppStore } from "../stores/useAppStore";

export default function DashboardPage() {
  const role = useAppStore((state) => state.currentRole);

  if (role === "owner") {
    return <OwnerDashboard />;
  }

  if (role === "admin") {
    return <AdminDashboard />;
  }

  return <NurseDashboard />;
}

function NurseDashboard() {
  const contract = useAppStore(selectActiveContract);
  const nurseProfile = useAppStore(selectCurrentNurseProfile);
  const shortlistCount = useAppStore((state) => state.shortlist.length);
  const swipeCount = useAppStore((state) => state.swipeQueue.length);

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-white p-8 shadow-lg shadow-slate-900/5">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-sky-600">Next Contract</p>
            <h1 className="text-2xl font-semibold text-slate-900">
              {contract?.hospital ?? "Add your next assignment"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              We&apos;re filtering listings for your {contract?.shiftType ?? "preferred"} shift and {nurseProfile?.preferences.commute.maxMinutes ?? 0}
              min commute guardrail.
            </p>
            {contract && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                <MapPin className="h-4 w-4 text-sky-600" />
                Starts {new Date(contract.startDate).toLocaleDateString()} • Stipend ${contract.weeklyStipend}/wk
              </div>
            )}
          </div>
          <Link
            to="/swipe"
            className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-900/20 hover:bg-sky-500"
          >
            Continue swiping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-900/5">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-sky-600">Progress</p>
              <h2 className="text-lg font-semibold text-slate-900">Match health</h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-600" />
              {shortlistCount} shortlisted
            </span>
          </header>

          <div className="grid gap-4 sm:grid-cols-2">
            <ProgressCard label="Matches ready" value={swipeCount} helper="Swipe queue" />
            <ProgressCard
              label="Contract guardrails"
              value={nurseProfile ? nurseProfile.preferences.maxBudgetMonthly : 0}
              helper="Monthly budget"
              format={(val) => `$${val.toLocaleString()}`}
            />
            <ProgressCard
              label="Safety threshold"
              value={nurseProfile ? nurseProfile.preferences.minSafetyScore : 0}
              helper="Minimum safety score"
            />
            <ProgressCard
              label="Commute limit"
              value={nurseProfile ? nurseProfile.preferences.commute.maxMinutes : 0}
              helper="Minutes max"
              format={(val) => `${val} min`}
            />
          </div>
        </div>
        <ShortlistBoard />
      </section>
    </div>
  );
}

function OwnerDashboard() {
  const listings = useAppStore((state) => state.listings);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-900/5">
        <p className="text-xs uppercase tracking-wide text-sky-600">Owner summary</p>
        <h1 className="text-2xl font-semibold text-slate-900">Signal from nurse marketplace</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track matches, quick holds, and boost performance for your portfolio.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">48 hr response SLA</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">Verified badges featured</span>
        </div>
      </section>
      <ListingTable listings={listings} />
    </div>
  );
}

function AdminDashboard() {
  const listings = useAppStore((state) => state.listings);

  return (
    <div className="space-y-8">
      <AdminOverview />
      <section className="space-y-4">
        <header>
          <p className="text-xs uppercase tracking-wide text-sky-600">Current metro</p>
          <h2 className="text-lg font-semibold text-slate-900">San Francisco Bay Area deployment</h2>
        </header>
        <ListingTable listings={listings} />
      </section>
    </div>
  );
}

interface ProgressCardProps {
  label: string;
  value: number;
  helper: string;
  format?: (value: number) => string;
}

function ProgressCard({ label, value, helper, format }: ProgressCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{format ? format(value) : value}</p>
      <p className="text-xs text-slate-500">{helper}</p>
    </div>
  );
}
