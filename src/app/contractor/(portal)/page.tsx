import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CONTRACTOR_SESSION_COOKIE, getSessionContractorId } from "@/lib/contractor-auth";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  BOOKING_STATUSES,
  getTimeSlots,
  getSlaStatus,
  type BookingStatus,
} from "@/lib/constants";
import {
  OwnStatusForm,
  TechnicianAssignForm,
  OwnCompletionNotesField,
  OwnEscalationControls,
} from "./job-controls";

function slotLabel(value: string): string {
  return getTimeSlots().find((s) => s.value === value)?.label ?? value;
}

const SLA_BADGE: Record<"on-time" | "late", string> = {
  "on-time": "bg-green-100 text-green-800",
  late: "bg-red-100 text-red-800",
};

export default async function ContractorJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const cookieStore = await cookies();
  const contractorId = await getSessionContractorId(cookieStore.get(CONTRACTOR_SESSION_COOKIE)?.value);
  if (!contractorId) redirect("/contractor/login");

  const { status: statusFilter } = await searchParams;

  const [bookings, technicians, counts, totalCount] = await Promise.all([
    prisma.booking.findMany({
      where: { contractorId, ...(statusFilter ? { status: statusFilter } : {}) },
      include: { technician: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.technician.findMany({ where: { contractorId, active: true }, orderBy: { name: "asc" } }),
    prisma.booking.groupBy({ by: ["status"], where: { contractorId }, _count: true }),
    prisma.booking.count({ where: { contractorId } }),
  ]);
  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Your Jobs</h1>
      <p className="mb-6 text-sm text-slate-500">
        {bookings.length} job{bookings.length === 1 ? "" : "s"}
        {statusFilter ? ` — filtered by ${STATUS_LABELS[statusFilter as BookingStatus] ?? statusFilter}` : ""}
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip label="All" href="/contractor" active={!statusFilter} count={totalCount} />
        {BOOKING_STATUSES.map((s) => (
          <FilterChip
            key={s}
            label={STATUS_LABELS[s]}
            href={`/contractor?status=${s}`}
            active={statusFilter === s}
            count={countByStatus[s] ?? 0}
          />
        ))}
      </div>

      <div className="space-y-4">
        {bookings.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No jobs yet.
          </p>
        )}

        {bookings.map((b) => {
          const status = b.status as BookingStatus;
          const sla = getSlaStatus(b.preferredDate, b.preferredTimeSlot, b.startedAt);
          const mapHref =
            b.locationMapLink ||
            (b.locationLat != null && b.locationLng != null
              ? `https://www.google.com/maps?q=${b.locationLat},${b.locationLng}`
              : null);
          return (
            <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {b.category} → {b.subcategory} → {b.accessory} × {b.quantity}
                  </p>
                  <p className="text-sm text-slate-500">
                    {b.customerName} · {b.phone} · {b.city}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {sla !== "pending" && (
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${SLA_BADGE[sla]}`}>
                      {sla === "on-time" ? "On time" : "Late"}
                    </span>
                  )}
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[status]}`}>
                    {STATUS_LABELS[status]}
                  </span>
                </div>
              </div>

              <p className="mt-2 text-xs font-medium text-orange-700">
                {b.qualityTier} quality ({b.selectedBrand}) ·{" "}
                {b.contractorPayout != null ? (
                  <span className="font-bold">{b.contractorPayout} SAR payout</span>
                ) : (
                  "Payout pending"
                )}
              </p>

              <p className="mt-2 text-sm text-slate-700">{b.description}</p>
              <p className="mt-1 text-xs text-slate-500">
                {b.addressDetails} · {b.preferredDate} · {slotLabel(b.preferredTimeSlot)}
                {mapHref && (
                  <>
                    {" · "}
                    <a
                      href={mapHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 underline"
                    >
                      View location
                    </a>
                  </>
                )}
              </p>

              {b.technician && (
                <p className="mt-1 text-xs text-slate-500">
                  Assigned to your technician: {b.technician.name} ({b.technician.phone})
                </p>
              )}

              <div className="mt-2">
                <OwnEscalationControls
                  bookingId={b.id}
                  isEscalated={b.isEscalated}
                  escalationReason={b.escalationReason}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
                <TechnicianAssignForm
                  bookingId={b.id}
                  currentTechnicianId={b.technicianId}
                  technicians={technicians}
                />
                <OwnStatusForm bookingId={b.id} currentStatus={status} />
              </div>

              <div className="mt-3 border-t border-slate-100 pt-3">
                <OwnCompletionNotesField bookingId={b.id} notes={b.completionNotes} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  href,
  active,
  count,
}: {
  label: string;
  href: string;
  active: boolean;
  count: number;
}) {
  return (
    <a
      href={href}
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
      }`}
    >
      {label} ({count})
    </a>
  );
}
