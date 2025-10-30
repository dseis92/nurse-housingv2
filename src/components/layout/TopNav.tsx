import { useMemo } from "react";
import { Bell, Globe, Menu, Search, ShieldCheck, User } from "lucide-react";
import { selectActiveContract, useAppStore } from "../../stores/useAppStore";
import UserRoleSwitcher from "./UserRoleSwitcher";

export default function TopNav() {
  const currentUser = useAppStore((state) => state.users.find((user) => user.id === state.currentUserId));
  const contract = useAppStore(selectActiveContract);
  const shortlist = useAppStore((state) => state.shortlist);

  const contractSummary = useMemo(() => {
    if (!contract) return null;
    const startLabel = new Date(contract.startDate).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    return `${contract.hospital} • ${contract.shiftType.toUpperCase()} • ${startLabel}`;
  }, [contract]);

  const assignmentCity = contract?.city ?? contract?.hospital ?? "Anywhere";

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--nh-border)] bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-10">
        <Brand />
        <SearchPill assignmentCity={assignmentCity} hasContract={Boolean(contract)} />
        <RightControls currentUserName={currentUser?.fullName} avatarUrl={currentUser?.avatarUrl} shortlistCount={shortlist.length} />
      </div>

      {contractSummary && (
        <div className="border-t border-[var(--nh-border)] bg-white/70">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-4 py-3 text-xs font-medium uppercase tracking-[0.18em] text-[var(--nh-text-secondary)] sm:px-6 lg:px-10">
            <ShieldCheck className="h-4 w-4 text-[var(--nh-accent)]" />
            {contractSummary}
          </div>
        </div>
      )}
    </header>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--nh-accent-soft)] text-[var(--nh-accent)] shadow-[var(--nh-shadow-soft)]">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <div className="hidden flex-col leading-tight md:flex">
        <span className="text-base font-semibold tracking-tight text-[var(--nh-text-primary)]">NurseStays</span>
        <span className="text-xs text-[var(--nh-text-secondary)]">Safe, vetted homes for travel nurses</span>
      </div>
    </div>
  );
}

function SearchPill({ assignmentCity, hasContract }: { assignmentCity: string; hasContract: boolean }) {
  return (
    <button
      type="button"
      className="hidden min-w-[340px] items-center divide-x divide-[var(--nh-border)] rounded-full border border-[var(--nh-border)] bg-white py-2 pl-5 pr-2 text-left shadow-[var(--nh-shadow-soft)] transition hover:border-[var(--nh-border-strong)] md:flex"
    >
      <div className="flex flex-col pr-5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">Where</span>
        <span className="text-sm font-semibold text-[var(--nh-text-primary)]">{assignmentCity}</span>
      </div>
      <div className="flex flex-col px-5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">When</span>
        <span className="text-sm font-semibold text-[var(--nh-text-primary)]">{hasContract ? "Contract dates" : "Any week"}</span>
      </div>
      <div className="flex flex-1 items-center justify-between pl-5">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">Who</span>
          <span className="text-sm font-semibold text-[var(--nh-text-primary)]">Add guests</span>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--nh-accent)] text-white">
          <Search className="h-4 w-4" />
        </span>
      </div>
    </button>
  );
}

function RightControls({
  currentUserName,
  avatarUrl,
  shortlistCount,
}: {
  currentUserName?: string;
  avatarUrl?: string | null;
  shortlistCount: number;
}) {
  const initials =
    currentUserName
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2) ?? undefined;

  return (
    <div className="flex items-center gap-3 text-sm">
      <button
        type="button"
        className="hidden rounded-full px-4 py-2 font-medium text-[var(--nh-text-primary)] transition hover:bg-[var(--nh-surface-muted)] xl:block"
      >
        Become a host
      </button>
      <button
        type="button"
        className="hidden h-10 w-10 items-center justify-center rounded-full border border-[var(--nh-border)] text-[var(--nh-text-primary)] transition hover:bg-[var(--nh-surface-muted)] lg:flex"
      >
        <Globe className="h-5 w-5" />
      </button>
      <div className="hidden lg:block">
        <UserRoleSwitcher />
      </div>
      <button
        type="button"
        className="relative flex h-11 items-center gap-3 rounded-full border border-[var(--nh-border)] bg-white px-3 transition hover:border-[var(--nh-border-strong)] hover:shadow-[var(--nh-shadow-soft)]"
      >
        <Menu className="h-5 w-5 text-[var(--nh-text-secondary)]" />
        {avatarUrl ? (
          <img src={avatarUrl} alt={currentUserName ?? "You"} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--nh-surface-muted)] text-xs font-semibold text-[var(--nh-text-primary)]">
            {initials ?? <User className="h-4 w-4" />}
          </span>
        )}
        {shortlistCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--nh-accent)] text-[10px] font-semibold text-white">
            {shortlistCount}
          </span>
        )}
      </button>
      <button
        type="button"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--nh-border)] text-[var(--nh-text-primary)] transition hover:bg-[var(--nh-surface-muted)] lg:hidden"
      >
        <Bell className="h-5 w-5" />
        {shortlistCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--nh-accent)] text-[10px] font-semibold text-white">
            {shortlistCount}
          </span>
        )}
      </button>
    </div>
  );
}

