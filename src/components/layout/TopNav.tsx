import { useMemo } from "react";
import { Bell, MapPin, ShieldCheck } from "lucide-react";
import { selectActiveContract, useAppStore } from "../../stores/useAppStore";
import UserRoleSwitcher from "./UserRoleSwitcher";

export default function TopNav() {
  const currentUser = useAppStore((state) => state.users.find((user) => user.id === state.currentUserId));
  const contract = useAppStore(selectActiveContract);
  const shortlist = useAppStore((state) => state.shortlist);

  const contractSummary = useMemo(() => {
    if (!contract) return null;
    return `${contract.hospital} • ${contract.shiftType.toUpperCase()} • Starts ${new Date(
      contract.startDate
    ).toLocaleDateString()}`;
  }, [contract]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-6 border-b border-slate-200/60 bg-white/80 px-4 backdrop-blur-md shadow-sm shadow-slate-900/5 sm:px-6 lg:px-10">
      <div className="flex flex-1 items-center gap-4">
        <UserRoleSwitcher />
        {contract && (
          <div className="hidden shrink-0 rounded-full border border-sky-200/70 bg-sky-50/80 px-3 py-1.5 text-xs font-medium text-sky-700 sm:flex sm:items-center sm:gap-2">
            <ShieldCheck className="h-4 w-4 text-sky-600" />
            {contractSummary}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className="hidden sm:flex sm:flex-col sm:items-end">
          <span className="font-medium text-slate-900">{currentUser?.fullName ?? "Guest"}</span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3 text-sky-500" />
            San Francisco Bay Area
          </span>
        </div>
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-sky-200 hover:text-slate-900"
        >
          <Bell className="h-5 w-5" />
          {shortlist.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-[10px] font-semibold text-white">
              {shortlist.length}
            </span>
          )}
        </button>
        <div className="hidden h-10 w-10 overflow-hidden rounded-full border border-slate-200 sm:block">
          {currentUser?.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs font-semibold text-slate-500">
              {currentUser?.fullName
                ?.split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
