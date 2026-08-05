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

// Flat customer-facing booking/dispatch fee per Financial Plan §pricing —
// charged once per request (visit), not per item, since it exists to
// discourage no-shows on the appointment itself.
export const BOOKING_FEE_SAR = 20;

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

/** Combines an ISO date ("YYYY-MM-DD") with a slot's "HH:MM" start time into
 * a real Date — shared by the date/time picker (UI) and the booking server
 * action (authoritative check), so "at least 24 hours' notice" is enforced
 * the same way in both places. */
export function getSlotStart(dateISO: string, slotValue: string): Date {
  const [y, m, d] = dateISO.split("-").map(Number);
  const [hh, mm] = slotValue.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

// Minimum lead time between booking and the earliest offered slot.
export const MIN_BOOKING_LEAD_HOURS = 24;

/** SLA compliance per the Contractor-facing SLA doc: did work start
 * (proxy for arrival) within the promised hourly slot? "pending" until the
 * job has actually started. */
export function getSlaStatus(
  preferredDate: string,
  preferredTimeSlot: string,
  startedAt: Date | null
): "pending" | "on-time" | "late" {
  if (!startedAt) return "pending";
  const [y, m, d] = preferredDate.split("-").map(Number);
  const [hh, mm] = preferredTimeSlot.split(":").map(Number);
  const windowEnd = new Date(y, m - 1, d, hh + 1, mm);
  return startedAt <= windowEnd ? "on-time" : "late";
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

// A contractor can only push their own job forward through this subset of
// transitions — not un-assign it or send it back to Pending, which stays an
// admin-only dispatch call on the main Bookings page.
export const SELF_ALLOWED_TRANSITIONS: Record<string, BookingStatus[]> = {
  ASSIGNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
};

// Timestamp field to stamp with "now" whenever a booking enters that status.
export const STATUS_TIMESTAMP_FIELD = {
  PENDING: null,
  ASSIGNED: "assignedAt",
  IN_PROGRESS: "startedAt",
  COMPLETED: "completedAt",
  CANCELLED: "cancelledAt",
} as const;

export const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  ASSIGNED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-indigo-100 text-indigo-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-200 text-gray-600",
};

// Contractor onboarding funnel, per the Partnership Framework doc: screening
// -> document/license checks -> active partner, with suspend/reject as exits.
export const ONBOARDING_STATUSES = [
  "APPLIED",
  "UNDER_REVIEW",
  "ACTIVE",
  "SUSPENDED",
  "REJECTED",
] as const;

export type OnboardingStatus = (typeof ONBOARDING_STATUSES)[number];

export const ONBOARDING_STATUS_LABELS: Record<OnboardingStatus, string> = {
  APPLIED: "Applied",
  UNDER_REVIEW: "Under Review",
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  REJECTED: "Rejected",
};

export const ONBOARDING_STATUS_COLORS: Record<OnboardingStatus, string> = {
  APPLIED: "bg-slate-200 text-slate-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-800",
  ACTIVE: "bg-green-100 text-green-800",
  SUSPENDED: "bg-red-100 text-red-800",
  REJECTED: "bg-gray-200 text-gray-500",
};

// Simple performance tier per the Partnership Framework doc §"Tiering" —
// better-performing partners can later get priority routing / commission
// discounts.
export const CONTRACTOR_TIERS = ["Bronze", "Silver", "Gold"] as const;
export type ContractorTier = (typeof CONTRACTOR_TIERS)[number];

export const TIER_COLORS: Record<ContractorTier, string> = {
  Bronze: "bg-orange-100 text-orange-800",
  Silver: "bg-slate-200 text-slate-700",
  Gold: "bg-yellow-100 text-yellow-800",
};
