import { Calendar, MapPin } from "lucide-react";
import { useAppStore } from "../stores/useAppStore";

export default function AdminContractsPage() {
  const contracts = useAppStore((state) => state.contracts);
  const nurses = useAppStore((state) => state.nurseProfiles);
  const users = useAppStore((state) => state.users);

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-teal-600">Assignments</p>
        <h1 className="text-2xl font-semibold text-zinc-900">Active nurse contracts</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Monitor stipend guardrails, start dates, and intake completion ahead of launch.
        </p>
      </header>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-zinc-100 text-sm">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Nurse
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Hospital
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Shift
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Stipend
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Dates
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {contracts.map((contract) => {
              const nurseProfile = nurses.find((profile) => profile.id === contract.nurseProfileId);
              const user = users.find((candidate) => candidate.id === nurseProfile?.userId);
              return (
                <tr key={contract.id} className="hover:bg-zinc-50/60">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-zinc-900">{user?.fullName ?? "Nurse"}</div>
                    <div className="text-xs text-zinc-500">{nurseProfile?.specialty}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-700">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-teal-600" />
                      {contract.hospital}
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize text-sm text-zinc-700">{contract.shiftType}</td>
                  <td className="px-6 py-4 font-semibold text-zinc-900">${contract.weeklyStipend}</td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-teal-600" />
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
