import { useMemo } from "react";
import { useAppStore } from "../../stores/useAppStore";
import type { UserRole } from "../../types";

const roleLabels: Record<UserRole, string> = {
  nurse: "Nurse",
  owner: "Owner",
  admin: "Ops",
};

export default function UserRoleSwitcher() {
  const role = useAppStore((state) => state.currentRole);
  const setRole = useAppStore((state) => state.actions.setRole);

  const roles = useMemo<UserRole[]>(() => ["nurse", "owner", "admin"], []);

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white p-1 text-xs">
      {roles.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setRole(value)}
          className={[
            "rounded-full px-3 py-1 font-medium transition",
            role === value ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
          ].join(" ")}
        >
          {roleLabels[value]}
        </button>
      ))}
    </div>
  );
}

