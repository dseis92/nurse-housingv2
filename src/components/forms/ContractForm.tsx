import { FormEvent, useEffect, useState } from "react";
import { MapPin, Shield, Truck } from "lucide-react";
import { selectActiveContract, selectCurrentNurseProfile, useAppStore } from "../../stores/useAppStore";
import type { Contract } from "../../types";

interface FormState {
  hospital: string;
  unit: string;
  shiftType: Contract["shiftType"];
  startDate: string;
  endDate: string;
  weeklyStipend: number;
  totalBudget: number;
  pets: boolean;
  parkingNeeded: boolean;
  notes: string;
}

const toFormState = (contract: Contract): FormState => ({
  hospital: contract.hospital,
  unit: contract.unit,
  shiftType: contract.shiftType,
  startDate: contract.startDate.slice(0, 10),
  endDate: contract.endDate.slice(0, 10),
  weeklyStipend: contract.weeklyStipend,
  totalBudget: contract.totalBudget,
  pets: contract.pets,
  parkingNeeded: contract.parkingNeeded,
  notes: contract.notes ?? "",
});

export default function ContractForm() {
  const contract = useAppStore(selectActiveContract);
  const nurseProfile = useAppStore(selectCurrentNurseProfile);
  const updateContract = useAppStore((state) => state.actions.updateContract);

  const [formState, setFormState] = useState<FormState | undefined>(contract ? toFormState(contract) : undefined);

  useEffect(() => {
    if (contract) setFormState(toFormState(contract));
  }, [contract]);

  if (!contract || !formState || !nurseProfile) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500">
        Create a contract to guide matching. Once you add a contract, we will score listings automatically.
      </div>
    );
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateContract({
      ...contract,
      ...formState,
      startDate: new Date(formState.startDate).toISOString(),
      endDate: new Date(formState.endDate).toISOString(),
      status: "active",
    });
  };

  const updateField = (field: keyof FormState, value: string | number | boolean) => {
    setFormState((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit}
    >
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-teal-600">Assignment</p>
            <h2 className="text-xl font-semibold text-zinc-900">Hospital details</h2>
            <p className="mt-1 text-sm text-zinc-500">
              We use these contract guardrails to curate matches and calculate commute distances.
            </p>
          </div>
          <div className="hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-500 sm:block">
            Nurse profile • {nurseProfile.specialty} ({nurseProfile.preferredShift} shift)
          </div>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Hospital" icon={MapPin}>
            <input
              value={formState.hospital}
              onChange={(event) => updateField("hospital", event.target.value)}
              className="form-input"
              required
            />
          </Field>
          <Field label="Unit" icon={Shield}>
            <input
              value={formState.unit}
              onChange={(event) => updateField("unit", event.target.value)}
              className="form-input"
              required
            />
          </Field>
          <Field label="Shift">
            <select
              value={formState.shiftType}
              onChange={(event) => updateField("shiftType", event.target.value as Contract["shiftType"])}
              className="form-input"
              required
            >
              <option value="day">Day</option>
              <option value="night">Night</option>
              <option value="swing">Swing</option>
            </select>
          </Field>
          <Field label="Weekly stipend ($)">
            <input
              type="number"
              min={0}
              step={50}
              value={formState.weeklyStipend}
              onChange={(event) => updateField("weeklyStipend", Number(event.target.value))}
              className="form-input"
              required
            />
          </Field>
          <Field label="Total budget ($)">
            <input
              type="number"
              min={0}
              step={100}
              value={formState.totalBudget}
              onChange={(event) => updateField("totalBudget", Number(event.target.value))}
              className="form-input"
              required
            />
          </Field>
          <Field label="Start date">
            <input
              type="date"
              value={formState.startDate}
              onChange={(event) => updateField("startDate", event.target.value)}
              className="form-input"
              required
            />
          </Field>
          <Field label="End date">
            <input
              type="date"
              value={formState.endDate}
              onChange={(event) => updateField("endDate", event.target.value)}
              className="form-input"
              required
            />
          </Field>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-teal-600">Requirements</p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-900">Guardrails</h3>
          <div className="mt-4 space-y-4 text-sm text-zinc-600">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formState.pets}
                onChange={(event) => updateField("pets", event.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
              />
              Traveling with pets
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formState.parkingNeeded}
                onChange={(event) => updateField("parkingNeeded", event.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
              />
              Overnight parking required
            </label>
            <div className="flex items-start gap-3 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-500">
              <Truck className="mt-0.5 h-4 w-4 text-teal-600" />
              <span>We apply commute guardrails and stipend checks before adding homes to your swipe queue.</span>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-teal-600">Notes</p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-900">Special requests</h3>
          <textarea
            value={formState.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Any specific building requirements, safety concerns, or schedule constraints?"
            rows={6}
            className="form-input mt-4"
          />
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
        >
          Save contract guardrails
        </button>
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

function Field({ label, icon: Icon, children }: FieldProps) {
  return (
    <label className="space-y-1 text-sm font-medium text-zinc-600">
      <span className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
        {Icon && <Icon className="h-4 w-4 text-teal-600" />}
        {label}
      </span>
      {children}
    </label>
  );
}

