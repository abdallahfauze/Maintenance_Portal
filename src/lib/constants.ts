// Stage 0 launches in Jeddah only, per the business plan's phased rollout.
// Add cities here as later phases open (Riyadh, then Dammam — see the
// business plan's Financial Plan §6.4 for the rollout timeline).
export const CITIES = ["Jeddah"] as const;

// Jeddah's approximate center — used as the default map view before a
// customer drops a pin or grants location access.
export const DEFAULT_MAP_CENTER = { lat: 21.5433, lng: 39.1728 };

// Saudi Arabia's work week is Saturday–Thursday; Friday is the weekly rest
// day. JS Date#getDay(): Sun=0 ... Fri=5 ... Sat=6.
export const CLOSED_WEEKDAY = 5; // Friday

export const BUSINESS_HOURS = { startHour: 8, endHour: 18 } as const;

/** Hourly slots from 8:00 AM to 6:00 PM, e.g. "08:00" -> "8:00 AM - 9:00 AM". */
export function getTimeSlots(): { value: string; label: string }[] {
  const slots: { value: string; label: string }[] = [];
  const { startHour, endHour } = BUSINESS_HOURS;
  for (let minutes = startHour * 60; minutes < endHour * 60; minutes += 60) {
    const from = formatClock(minutes);
    const to = formatClock(minutes + 60);
    slots.push({ value: `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`, label: `${from} - ${to}` });
  }
  return slots;
}

function formatClock(totalMinutes: number): string {
  const hour24 = Math.floor(totalMinutes / 60) % 24;
  const minute = totalMinutes % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${pad(minute)} ${period}`;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export const BOOKING_STATUSES = [
  "PENDING",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  ASSIGNED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-indigo-100 text-indigo-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-200 text-gray-600",
};
