import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  BOOKING_FEE_SAR,
  getTimeSlots,
  type BookingStatus,
} from "@/lib/constants";

function friendlyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(
    new Date(y, m - 1, d)
  );
}

function slotLabel(value: string): string {
  return getTimeSlots().find((s) => s.value === value)?.label ?? value;
}

export default async function RequestStatusPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const bookings = await prisma.booking.findMany({
    where: { requestId },
    include: { contractor: true },
    orderBy: { createdAt: "asc" },
  });

  if (bookings.length === 0) {
    notFound();
  }

  const first = bookings[0];
  const categories = await prisma.serviceCategory.findMany({
    where: { name: { in: [...new Set(bookings.map((b) => b.category))] } },
  });
  const categoryByName = new Map(categories.map((c) => [c.name, c]));

  const itemsTotal = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const grandTotal = itemsTotal + BOOKING_FEE_SAR;
  const mapHref =
    first.locationMapLink ||
    (first.locationLat != null && first.locationLng != null
      ? `https://www.google.com/maps?q=${first.locationLat},${first.locationLng}`
      : null);

  return (
    <div className="mx-auto min-h-screen max-w-xl px-6 py-12">
      <div className="app-backdrop" aria-hidden />

      <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-xl shadow-orange-900/5 backdrop-blur sm:p-8">
        <p className="text-sm text-slate-500">Request reference</p>
        <p className="mb-4 font-mono text-lg font-semibold text-slate-900">{requestId}</p>

        <div className="space-y-3">
          {bookings.map((b) => {
            const status = b.status as BookingStatus;
            const categoryInfo = categoryByName.get(b.category);
            return (
              <div
                key={b.id}
                className="rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-900 ring-1 ring-orange-100"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-wide text-orange-600">
                    {categoryInfo && <span className="mr-1">{categoryInfo.icon}</span>}
                    {b.category} → {b.subcategory}
                  </p>
                  <span
                    className={`inline-block shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}
                  >
                    {STATUS_LABELS[status]}
                  </span>
                </div>
                <p className="font-semibold">
                  {b.accessory} × {b.quantity}
                </p>
                <p className="text-xs text-orange-700">
                  {b.qualityTier} quality — {b.selectedBrand}
                </p>
                <p className="mt-1 text-lg font-bold">{b.totalPrice} SAR</p>
                <p className="text-xs text-orange-700">
                  {b.quantity} × ({b.selectedPrice} part + {b.laborFee} labor)
                </p>
                {b.contractor && (
                  <p className="mt-1 text-xs text-orange-700">
                    Assigned to {b.contractor.name} ({b.contractor.phone})
                  </p>
                )}
                <p className="mt-1 text-xs text-orange-800/80">{b.description}</p>
                {b.isEscalated && (
                  <p className="mt-2 rounded-lg bg-amber-100 px-3 py-2 text-xs font-medium text-amber-900">
                    ⚠ This job may be running behind schedule — our team is on it and will update
                    you shortly.
                  </p>
                )}
                {b.completionNotes && (
                  <p className="mt-2 rounded-lg bg-white/60 px-3 py-2 text-xs text-orange-800">
                    <span className="font-semibold">Technician notes:</span> {b.completionNotes}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 space-y-1 border-t border-slate-200 pt-3 text-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span>Services</span>
            <span>{itemsTotal} SAR</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Booking fee</span>
            <span>{BOOKING_FEE_SAR} SAR</span>
          </div>
          <div className="flex items-center justify-between font-semibold text-slate-800">
            <span>Total for this visit</span>
            <span>{grandTotal} SAR</span>
          </div>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <Row label="City" value={first.city} />
          <Row label="Address details" value={first.addressDetails} />
          <Row
            label="Location"
            value={
              mapHref ? (
                <a href={mapHref} target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">
                  View on map
                </a>
              ) : (
                "Not provided"
              )
            }
          />
          <Row
            label="Scheduled for"
            value={`${friendlyDate(first.preferredDate)} · ${slotLabel(first.preferredTimeSlot)}`}
          />
        </dl>

        <p className="mt-6 text-xs text-slate-500">
          {`We'll contact you at ${first.phone} to confirm the visit. The price above is all-inclusive — part and labor — so there's nothing more to confirm before dispatch. Bookmark this page to check status any time.`}
        </p>

        <Link href="/" className="mt-6 inline-block text-sm font-medium text-orange-600 underline">
          Book another service
        </Link>
      </div>
    </div>
  );
}

function Row({ label: rowLabel, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
      <dt className="shrink-0 text-slate-500">{rowLabel}</dt>
      <dd className="text-right text-slate-900">{value}</dd>
    </div>
  );
}
