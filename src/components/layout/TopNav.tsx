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
    <header className="sticky top-0 z-20 flex h-16 items-center gap-6 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-10">
      <div className="flex flex-1 items-center gap-4">
        <UserRoleSwitcher />
        {contract && (
          <div className="hidden shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 sm:flex sm:items-center sm:gap-2">
            <ShieldCheck className="h-4 w-4 text-teal-600" />
            {contractSummary}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className="hidden sm:flex sm:flex-col sm:items-end">
          <span className="font-medium text-zinc-900">{currentUser?.fullName ?? "Guest"}</span>
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <MapPin className="h-3 w-3" />
            San Francisco Bay Area
          </span>
        </div>
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:text-zinc-900"
        >
          <Bell className="h-5 w-5" />
          {shortlist.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-semibold text-white">
              {shortlist.length}
            </span>
          )}
        </button>
        <div className="hidden h-10 w-10 overflow-hidden rounded-full border border-zinc-200 sm:block">
          {currentUser?.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-xs font-semibold text-zinc-500">
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

