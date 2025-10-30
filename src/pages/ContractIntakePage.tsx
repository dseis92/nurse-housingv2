import { ClipboardList, Lock, MapPin } from "lucide-react";
import ContractForm from "../components/forms/ContractForm";
import { selectCurrentNurseProfile, useAppStore } from "../stores/useAppStore";

export default function ContractIntakePage() {
  const nurseProfile = useAppStore(selectCurrentNurseProfile);

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-sky-600">Contract guardrails</p>
            <h1 className="text-2xl font-semibold text-slate-900">Match intake</h1>
            <p className="mt-2 text-sm text-slate-600">
              This is the only form you complete. Our team uses it to curate pre-verified housing in your swipe queue.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold">
              <MapPin className="h-3.5 w-3.5 text-sky-600" />
              Bay Area Metro
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold">
              <Lock className="h-3.5 w-3.5 text-sky-600" />
              RLS protected
            </div>
          </div>
        </div>
      </section>

      <ContractForm />

      {nurseProfile && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex items-center gap-3 text-sm font-semibold text-slate-900">
            <ClipboardList className="h-4 w-4 text-sky-600" />
            Your standing guardrails
          </header>
          <div className="mt-4 grid gap-3 text-xs text-slate-500 sm:grid-cols-2 lg:grid-cols-4">
            <PreferencePill label="Max monthly budget" value={`$${nurseProfile.preferences.maxBudgetMonthly}`} />
            <PreferencePill label="Safety minimum" value={`${nurseProfile.preferences.minSafetyScore} score`} />
            <PreferencePill
              label="Commute"
              value={`${nurseProfile.preferences.commute.maxMinutes} min • no tolls`}
            />
            <PreferencePill
              label="Pets"
              value={nurseProfile.preferences.living.pets ? nurseProfile.preferences.living.petType ?? "Yes" : "No"}
            />
          </div>
        </section>
      )}
    </div>
  );
}

interface PreferencePillProps {
  label: string;
  value: string;
}

function PreferencePill({ label, value }: PreferencePillProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

