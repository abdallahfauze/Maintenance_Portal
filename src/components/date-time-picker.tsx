"use client";

import { useMemo, useState } from "react";
import { CLOSED_WEEKDAY, getTimeSlots } from "@/lib/constants";

type Props = {
  selectedDate: string; // ISO "YYYY-MM-DD", "" if none
  selectedSlot: string; // slot value e.g. "08:00", "" if none
  onSelectDate: (iso: string) => void;
  onSelectSlot: (slot: string) => void;
};

const WEEKDAY_LABELS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function DateTimePicker({ selectedDate, selectedSlot, onSelectDate, onSelectSlot }: Props) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const slots = useMemo(() => getTimeSlots(), []);

  const weeks = useMemo(() => {
    const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const lastOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
    // JS getDay(): Sun=0..Sat=6. Our grid starts on Saturday, so remap: Sat->0, Sun->1, ..., Fri->6.
    const leadingBlanks = (firstOfMonth.getDay() + 1) % 7;

    const days: (Date | null)[] = Array(leadingBlanks).fill(null);
    for (let day = 1; day <= lastOfMonth.getDate(); day++) {
      days.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day));
    }
    while (days.length % 7 !== 0) days.push(null);

    const rows: (Date | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
    return rows;
  }, [viewMonth]);

  const isPastOrClosed = (d: Date) => d < today || d.getDay() === CLOSED_WEEKDAY;
  const canGoPrev =
    viewMonth.getFullYear() > today.getFullYear() ||
    (viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() > today.getMonth());

  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-slate-700">Preferred date & time</span>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            disabled={!canGoPrev}
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
            className="rounded-full px-2 py-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
          >
            ‹
          </button>
          <span className="text-sm font-semibold text-slate-800">
            {MONTH_LABELS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
          </span>
          <button
            type="button"
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
            className="rounded-full px-2 py-1 text-slate-500 hover:bg-slate-100"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400">
          {WEEKDAY_LABELS.map((w) => (
            <div key={w} className={w === "Fri" ? "text-slate-300" : ""}>
              {w}
            </div>
          ))}
        </div>

        {weeks.map((row, i) => (
          <div key={i} className="grid grid-cols-7 gap-1 text-center">
            {row.map((d, j) => {
              if (!d) return <div key={j} className="py-1.5" />;
              const iso = toISODate(d);
              const disabled = isPastOrClosed(d);
              const isSelected = iso === selectedDate;
              return (
                <button
                  type="button"
                  key={j}
                  disabled={disabled}
                  onClick={() => onSelectDate(iso)}
                  className={`rounded-lg py-1.5 text-sm transition ${
                    disabled
                      ? "text-slate-300 line-through"
                      : isSelected
                        ? "bg-gradient-to-br from-orange-500 to-amber-500 font-semibold text-white shadow"
                        : "text-slate-700 hover:bg-orange-50"
                  }`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        ))}
        <p className="mt-2 text-[11px] text-slate-400">Open Saturday–Thursday, 8:00 AM – 6:00 PM.</p>
      </div>

      {selectedDate && (
        <div className="mt-3">
          <span className="mb-2 block text-xs font-medium text-slate-600">Available time slots</span>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => {
              const isSelected = slot.value === selectedSlot;
              return (
                <button
                  type="button"
                  key={slot.value}
                  onClick={() => onSelectSlot(slot.value)}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                    isSelected
                      ? "border-orange-500 bg-orange-500 text-white shadow"
                      : "border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50"
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
