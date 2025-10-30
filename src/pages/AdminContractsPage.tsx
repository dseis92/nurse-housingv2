import { Calendar, MapPin } from "lucide-react";
import { useAppStore } from "../stores/useAppStore";

export default function AdminContractsPage() {
  const contracts = useAppStore((state) => state.contracts);
  const nurses = useAppStore((state) => state.nurseProfiles);
  const users = useAppStore((state) => state.users);

  return (
    <div className="space-y-8">
      <header className="rounded-[36px] border border-[var(--nh-border)] bg-white/95 p-8 shadow-[var(--nh-shadow-soft)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">Assignments</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--nh-text-primary)]">
          Active nurse contracts
        </h1>
        <p className="mt-3 text-sm text-[var(--nh-text-secondary)]">
          Monitor stipend guardrails, start dates, and intake completion ahead of launch.
        </p>
      </header>

      <div className="overflow-hidden rounded-[36px] border border-[var(--nh-border)] bg-white/95 shadow-[var(--nh-shadow-soft)]">
        <table className="min-w-full divide-y divide-[var(--nh-border)] text-sm">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
                Nurse
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
                Hospital
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
                Shift
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
                Stipend
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
                Dates
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--nh-border)]">
            {contracts.map((contract) => {
              const nurseProfile = nurses.find((profile) => profile.id === contract.nurseProfileId);
              const user = users.find((candidate) => candidate.id === nurseProfile?.userId);
              return (
                <tr key={contract.id} className="hover:bg-[var(--nh-surface-muted)]/70">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[var(--nh-text-primary)]">{user?.fullName ?? "Nurse"}</div>
                    <div className="text-xs text-[var(--nh-text-secondary)]">{nurseProfile?.specialty}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--nh-text-secondary)]">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[var(--nh-accent)]" />
                      {contract.hospital}
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize text-sm text-[var(--nh-text-secondary)]">{contract.shiftType}</td>
                  <td className="px-6 py-4 font-semibold text-[var(--nh-text-primary)]">
                    ${contract.weeklyStipend.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs text-[var(--nh-text-secondary)]">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-[var(--nh-accent)]" />
                      {new Date(contract.startDate).toLocaleDateString()} →{" "}
                      {new Date(contract.endDate).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
