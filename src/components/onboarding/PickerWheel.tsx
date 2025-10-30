import { useEffect, useRef } from "react";

interface PickerWheelProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function PickerWheel({ options, value, onChange }: PickerWheelProps) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const index = options.indexOf(value);
    if (index >= 0 && listRef.current) {
      listRef.current.scrollTo({ top: index * 48, behavior: "smooth" });
    }
  }, [value, options]);

  return (
    <div className="relative mx-auto h-48 w-full max-w-xs overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-xl border border-sky-300/60 bg-sky-50/70 py-3" />
      <ul
        ref={listRef}
        className="flex h-full flex-col overflow-y-scroll py-8 text-center text-lg font-semibold text-slate-400"
      >
        {options.map((option) => {
          const isActive = option === value;
          return (
            <li
              key={option}
              className="py-3"
            >
              <button
                type="button"
                onClick={() => onChange(option)}
                className={`w-full text-center transition ${isActive ? "text-sky-600" : "text-slate-400"}`}
              >
                {option}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
