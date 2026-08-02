import { prisma } from "@/lib/prisma";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  BOOKING_STATUSES,
  BOOKING_FEE_SAR,
  getTimeSlots,
  getSlaStatus,
  type BookingStatus,
} from "@/lib/constants";
import {
  AssignForm,
  StatusForm,
  CompletionNotesField,
  EscalationControls,
} from "./booking-controls";

const SLA_BADGE: Record<"on-time" | "late", string> = {
  "on-time": "bg-green-100 text-green-800",
  late: "bg-red-100 text-red-800",
};

function slotLabel(value: string): string {
  return getTimeSlots().find((s) => s.value === value)?.label ?? value;
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusFilter } = await searchParams;

  const [bookings, contractors] = await Promise.all([
    prisma.booking.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      include: { contractor: true, technician: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contractor.findMany({
      where: { active: true, onboardingStatus: "ACTIVE" },
      orderBy: { name: "asc" },
    }),
  ]);

  const [counts, totalCount] = await Promise.all([
    prisma.booking.groupBy({ by: ["status"], _count: true }),
    prisma.booking.count(),
  ]);
  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  // Bookings created from the same customer submission share a requestId —
  // group them so the dashboard reads as one request per visit, even though
  // each item is still dispatched and tracked independently.
  const groups: (typeof bookings)[] = [];
  const groupIndex = new Map<string, number>();
  for (const b of bookings) {
    const idx = groupIndex.get(b.requestId);
    if (idx === undefined) {
      groupIndex.set(b.requestId, groups.length);
      groups.push([b]);
    } else {
      groups[idx].push(b);
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Bookings</h1>
      <p className="mb-6 text-sm text-slate-500">
        {bookings.length} booking{bookings.length === 1 ? "" : "s"}
        {statusFilter ? ` — filtered by ${STATUS_LABELS[statusFilter as BookingStatus] ?? statusFilter}` : ""}
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip label="All" href="/admin" active={!statusFilter} count={totalCount} />
        {BOOKING_STATUSES.map((s) => (
          <FilterChip
            key={s}
            label={STATUS_LABELS[s]}
            href={`/admin?status=${s}`}
            active={statusFilter === s}
            count={countByStatus[s] ?? 0}
          />
        ))}
      </div>

      <div className="space-y-4">
        {bookings.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No bookings yet.
          </p>
        )}

        {groups.map((group) => {
          const first = group[0];
          const requestTotal = group.reduce((sum, b) => sum + b.totalPrice, 0) + BOOKING_FEE_SAR;
          const platformTake =
            group.reduce((sum, b) => sum + (b.platformCommission ?? 0), 0) + BOOKING_FEE_SAR;
          const contractorTotal = group.reduce((sum, b) => sum + (b.contractorPayout ?? 0), 0);
          const allAssigned = group.every((b) => b.contractorPayout != null);
          return (
            <div key={first.requestId} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {first.customerName}
                    {group.length > 1 && (
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {group.length} items
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-500">
                    {first.city} · {first.phone} · Ref {first.requestId.slice(0, 8)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-800">{requestTotal} SAR</span>
                  <p className="text-xs text-slate-400">incl. {BOOKING_FEE_SAR} SAR booking fee</p>
                  {allAssigned && (
                    <p className="text-xs text-slate-500">
                      Platform {platformTake} SAR · Contractors {contractorTotal} SAR
                    </p>
                  )}
                </div>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                {first.addressDetails} · {first.preferredDate} · {slotLabel(first.preferredTimeSlot)}
                {first.locationMapLink && (
                  <>
                    {" · "}
                    <a
                      href={first.locationMapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 underline"
                    >
                      Map link
                    </a>
                  </>
                )}
                {!first.locationMapLink && first.locationLat != null && first.locationLng != null && (
                  <>
                    {" · "}
                    <a
                      href={`https://www.google.com/maps?q=${first.locationLat},${first.locationLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 underline"
                    >
                      View pin
                    </a>
                  </>
                )}
              </p>

              <div className="mt-3 space-y-3">
                {group.map((b) => {
                  const status = b.status as BookingStatus;
                  const eligibleContractors = contractors.filter((c) => c.category === b.category);
                  const sla = getSlaStatus(b.preferredDate, b.preferredTimeSlot, b.startedAt);
                  return (
                    <div key={b.id} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <p className="text-xs font-medium text-orange-700">
                          {b.category} → {b.subcategory} → {b.accessory} × {b.quantity} —{" "}
                          {b.qualityTier} ({b.selectedBrand}) ·{" "}
                          <span className="font-bold">{b.totalPrice} SAR</span>{" "}
                          <span className="font-normal text-orange-600">
                            ({b.quantity} × {b.selectedPrice} part + {b.laborUnits} ×{" "}
                            {b.laborFee} labor)
                          </span>
                        </p>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {sla !== "pending" && (
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${SLA_BADGE[sla]}`}
                            >
                              {sla === "on-time" ? "On time" : "Late"}
                            </span>
                          )}
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[status]}`}
                          >
                            {STATUS_LABELS[status]}
                          </span>
                        </div>
                      </div>

                      <p className="mt-2 text-sm text-slate-700">{b.description}</p>
                      {b.contractorPayout != null && (
                        <p className="mt-1 text-xs text-slate-500">
                          Payout {b.contractorPayout} SAR to contractor · {b.platformCommission} SAR
                          platform commission ({b.contractor?.commissionRate}%)
                        </p>
                      )}

                      <div className="mt-2">
                        <EscalationControls
                          bookingId={b.id}
                          isEscalated={b.isEscalated}
                          escalationReason={b.escalationReason}
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-3">
                        <AssignForm
                          bookingId={b.id}
                          currentContractorId={b.contractorId}
                          contractors={eligibleContractors}
                        />
                        <StatusForm bookingId={b.id} currentStatus={status} />
                        {b.contractor && (
                          <span className="text-xs text-slate-500">
                            Assigned to {b.contractor.name} ({b.contractor.phone})
                            {b.technician && ` — technician: ${b.technician.name} (${b.technician.phone})`}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 border-t border-slate-200 pt-3">
                        <CompletionNotesField bookingId={b.id} notes={b.completionNotes} />
                      </div>
                    </div>
                  );
                })}
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
