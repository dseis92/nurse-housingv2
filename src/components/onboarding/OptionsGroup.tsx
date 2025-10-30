import clsx from "clsx";

interface Option<T> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface OptionsGroupProps<T> {
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  columns?: 1 | 2;
}

export default function OptionsGroup<T extends string | number>({ options, value, onChange, columns = 1 }: OptionsGroupProps<T>) {
  return (
    <div className={clsx("grid gap-3", columns === 2 ? "sm:grid-cols-2" : "grid-cols-1")}> 
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={clsx(
              "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
              isSelected
                ? "border-sky-300 bg-sky-50 text-sky-800 shadow-sm shadow-sky-900/10"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900"
            )}
          >
            {option.icon && <span className="text-sky-500">{option.icon}</span>}
            <div>
              <div className="text-sm font-semibold">{option.label}</div>
              {option.description && <div className="text-xs text-slate-500">{option.description}</div>}
            </div>
          </button>
        );
      })}
    </div>
  );
}
