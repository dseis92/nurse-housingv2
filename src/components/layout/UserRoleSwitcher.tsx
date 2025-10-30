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
    <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 p-1 text-xs shadow-sm shadow-slate-900/10">
      {roles.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setRole(value)}
          className={[
            "rounded-full px-3 py-1 font-medium transition",
            role === value
              ? "bg-sky-600 text-white shadow-sm shadow-sky-900/20"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          ].join(" ")}
        >
          {roleLabels[value]}
        </button>
      ))}
    </div>
  );
}
