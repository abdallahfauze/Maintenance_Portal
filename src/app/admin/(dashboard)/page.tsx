import { prisma } from "@/lib/prisma";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  BOOKING_STATUSES,
  getTimeSlots,
  type BookingStatus,
} from "@/lib/constants";
import { AssignForm, StatusForm } from "./booking-controls";

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
      include: { contractor: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contractor.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  const [counts, totalCount] = await Promise.all([
    prisma.booking.groupBy({ by: ["status"], _count: true }),
    prisma.booking.count(),
  ]);
  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count]));

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

        {bookings.map((b) => {
          const status = b.status as BookingStatus;
          const eligibleContractors = contractors.filter((c) => c.category === b.category);
          return (
            <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {b.category} — {b.customerName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {b.city} · {b.phone} · Ref {b.id.slice(0, 8)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[status]}`}
                >
                  {STATUS_LABELS[status]}
                </span>
              </div>

              <p className="mt-2 text-xs font-medium text-orange-700">
                {b.category} → {b.subcategory} → {b.accessory} — {b.qualityTier} ({b.selectedBrand}) ·{" "}
                <span className="font-bold">{b.totalPrice} SAR</span>{" "}
                <span className="font-normal text-orange-600">
                  ({b.selectedPrice} part + {b.laborFee} labor)
                </span>
              </p>

              <p className="mt-3 text-sm text-slate-700">{b.description}</p>
              <p className="mt-1 text-xs text-slate-500">
                {b.addressDetails} · {b.preferredDate} · {slotLabel(b.preferredTimeSlot)}
                {b.locationMapLink && (
                  <>
                    {" · "}
                    <a
                      href={b.locationMapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 underline"
                    >
                      Map link
                    </a>
                  </>
                )}
                {!b.locationMapLink && b.locationLat != null && b.locationLng != null && (
                  <>
                    {" · "}
                    <a
                      href={`https://www.google.com/maps?q=${b.locationLat},${b.locationLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 underline"
                    >
                      View pin
                    </a>
                  </>
                )}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                <AssignForm
                  bookingId={b.id}
                  currentContractorId={b.contractorId}
                  contractors={eligibleContractors}
                />
                <StatusForm bookingId={b.id} currentStatus={status} />
                {b.contractor && (
                  <span className="text-xs text-slate-500">
                    Assigned to {b.contractor.name} ({b.contractor.phone})
                  </span>
                )}
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
