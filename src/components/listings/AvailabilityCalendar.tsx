import { useMemo } from "react";
import clsx from "clsx";
import type { AvailabilityBlock } from "../../types";

const dayFormatter = new Intl.DateTimeFormat(undefined, { day: "numeric" });
const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });

function enumerateDates(startIso: string, endIso: string) {
  const dates: string[] = [];
  const start = new Date(startIso);
  const end = new Date(endIso);
  let cursor = new Date(start);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function buildStatusMap(blocks: AvailabilityBlock[]) {
  const map = new Map<string, AvailabilityBlock["status"]>();
  blocks.forEach((block) => {
    enumerateDates(block.startDate, block.endDate).forEach((iso) => {
      map.set(iso, block.status);
    });
  });
  return map;
}

function createMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }
  return weeks;
}

type AvailabilityCalendarProps = {
  blocks: AvailabilityBlock[];
  selectedStart?: string | null;
  selectedEnd?: string | null;
  minStayNights?: number;
  onSelectDate?: (isoDate: string) => void;
};

export default function AvailabilityCalendar({
  blocks,
  selectedStart,
  selectedEnd,
  minStayNights,
  onSelectDate,
}: AvailabilityCalendarProps) {
  const statusMap = useMemo(() => buildStatusMap(blocks), [blocks]);
  const today = new Date();
  const startDate = selectedStart ? new Date(selectedStart) : null;
  const endDate = selectedEnd ? new Date(selectedEnd) : null;

  const months = useMemo(() => {
    if (!blocks.length) {
      return [0, 1].map((offset) => {
        const reference = new Date(today.getFullYear(), today.getMonth() + offset, 1);
        return {
          year: reference.getFullYear(),
          month: reference.getMonth(),
          label: monthFormatter.format(reference),
          weeks: createMonthMatrix(reference.getFullYear(), reference.getMonth()),
        };
      });
    }

    const sorted = [...blocks].sort((a, b) => a.startDate.localeCompare(b.startDate));
    const minDate = new Date(sorted[0].startDate);
    const maxDate = new Date(sorted[sorted.length - 1].endDate);
    const monthCount = Math.min(
      4,
      Math.max(2, (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth()) + 1)
    );

    return Array.from({ length: monthCount }).map((_, offset) => {
      const reference = new Date(minDate.getFullYear(), minDate.getMonth() + offset, 1);
      return {
        year: reference.getFullYear(),
        month: reference.getMonth(),
        label: monthFormatter.format(reference),
        weeks: createMonthMatrix(reference.getFullYear(), reference.getMonth()),
      };
    });
  }, [blocks, today]);

  const legend = [
    { label: "Available", tone: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    { label: "Held", tone: "bg-amber-100 text-amber-700 border-amber-200" },
    { label: "Booked", tone: "bg-rose-100 text-rose-700 border-rose-200" },
  ];

  return (
    <div className="space-y-4">
      {minStayNights ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
          Minimum stay:{" "}
          {minStayNights % 7 === 0
            ? `${minStayNights / 7} week${minStayNights / 7 === 1 ? "" : "s"}`
            : `${minStayNights} night${minStayNights === 1 ? "" : "s"}`}
        </p>
      ) : null}
      <div className="grid gap-6 sm:grid-cols-2">
        {months.map((month) => (
          <div
            key={month.label}
            className="rounded-3xl border border-[var(--nh-border)] bg-white/90 p-4 shadow-[var(--nh-shadow-soft)]"
          >
            <div className="mb-3 flex items-center justify-between text-sm font-semibold text-[var(--nh-text-primary)]">
              <span>{month.label}</span>
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
                Sun – Sat
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
              {"SMTWTFS".split("").map((day) => (
                <span key={day} className="text-center">
                  {day}
                </span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1 text-sm">
              {month.weeks.flat().map((day, index) => {
                if (day === null) {
                  return <span key={`empty-${index}`} className="h-9" />;
                }
                const cellDate = new Date(Date.UTC(month.year, month.month, day));
                const iso = cellDate.toISOString().slice(0, 10);
                const status = statusMap.get(iso) ?? "available";
                let tone = "border-[var(--nh-border)] bg-white text-[var(--nh-text-secondary)]";
                if (status === "available") tone = "border-emerald-200 bg-emerald-50 text-emerald-700";
                if (status === "held") tone = "border-amber-200 bg-amber-50 text-amber-700";
                if (status === "booked") tone = "border-rose-200 bg-rose-50 text-rose-700";
                const isPast = cellDate < new Date(today.toDateString());
                const isUnavailable = status === "held" || status === "booked" || isPast;
                const isInRange =
                  startDate &&
                  ((endDate && cellDate >= startDate && cellDate <= endDate) ||
                    (!endDate && cellDate.getTime() === startDate.getTime()));
                return (
                  <button
                    key={iso}
                    type="button"
                    className={clsx(
                      "grid h-9 place-items-center rounded-xl border text-xs font-semibold transition",
                      tone,
                      isPast && "opacity-60",
                      isInRange && "ring-2 ring-[var(--nh-accent)] ring-offset-1 ring-offset-white",
                      !isUnavailable && onSelectDate && "hover:shadow-[0_0_0_2px_rgba(16,185,129,0.35)] focus:outline-none focus:ring-2 focus:ring-[var(--nh-accent-soft)]"
                    )}
                    onClick={() => {
                      if (!onSelectDate || isUnavailable) return;
                      onSelectDate(iso);
                    }}
                    disabled={isUnavailable || !onSelectDate}
                    aria-disabled={isUnavailable}
                    aria-pressed={isInRange ? "true" : undefined}
                  >
                    {dayFormatter.format(cellDate)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
        {legend.map((item) => (
          <span
            key={item.label}
            className={clsx("inline-flex items-center gap-2 rounded-full border px-3 py-1", item.tone)}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
