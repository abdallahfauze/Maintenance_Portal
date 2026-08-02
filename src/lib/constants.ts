// Stage 0 launches in Jeddah only, per the business plan's phased rollout.
// Add cities here as later phases open (Riyadh, then Dammam — see the
// business plan's Financial Plan §6.4 for the rollout timeline).
export const CITIES = ["Jeddah"] as const;

export const TRADES = ["Electrical", "Plumbing", "HVAC", "Civil Finishes"] as const;

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
