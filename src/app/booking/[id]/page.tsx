import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { STATUS_COLORS, STATUS_LABELS, getTimeSlots, type BookingStatus } from "@/lib/constants";

function friendlyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(
    new Date(y, m - 1, d)
  );
}

function slotLabel(value: string): string {
  return getTimeSlots().find((s) => s.value === value)?.label ?? value;
}

export default async function BookingStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id }, include: { contractor: true } });

  if (!booking) {
    notFound();
  }

  const categoryInfo = await prisma.serviceCategory.findUnique({ where: { name: booking.category } });

  const status = booking.status as BookingStatus;
  const mapHref =
    booking.locationMapLink ||
    (booking.locationLat != null && booking.locationLng != null
      ? `https://www.google.com/maps?q=${booking.locationLat},${booking.locationLng}`
      : null);

  return (
    <div className="mx-auto min-h-screen max-w-xl px-6 py-12">
      <div className="app-backdrop" aria-hidden />

      <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-xl shadow-orange-900/5 backdrop-blur sm:p-8">
        <p className="text-sm text-slate-500">Booking reference</p>
        <p className="mb-4 font-mono text-lg font-semibold text-slate-900">{booking.id}</p>

        <div className="flex items-center gap-3">
          {categoryInfo && (
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-lg ${categoryInfo.gradient}`}
            >
              {categoryInfo.icon}
            </span>
          )}
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[status]}`}
          >
            {STATUS_LABELS[status]}
          </span>
        </div>

        <div className="mt-4 rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-900 ring-1 ring-orange-100">
          <p className="text-xs uppercase tracking-wide text-orange-600">
            {booking.category} → {booking.subcategory}
          </p>
          <p className="font-semibold">{booking.accessory}</p>
          <p className="text-xs text-orange-700">
            {booking.qualityTier} quality — {booking.selectedBrand}
          </p>
          <p className="mt-1 text-lg font-bold">{booking.totalPrice} SAR</p>
          <p className="text-xs text-orange-700">
            {booking.selectedPrice} part + {booking.laborFee} labor
          </p>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <Row label="City" value={booking.city} />
          <Row label="Address details" value={booking.addressDetails} />
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
          <Row label="Scheduled for" value={`${friendlyDate(booking.preferredDate)} · ${slotLabel(booking.preferredTimeSlot)}`} />
          <Row label="Description" value={booking.description} />
          {booking.contractor && (
            <Row label="Assigned to" value={`${booking.contractor.name} (${booking.contractor.phone})`} />
          )}
        </dl>

        <p className="mt-6 text-xs text-slate-500">
          {`We'll contact you at ${booking.phone} to confirm the visit. The price above is all-inclusive — part and labor — so there's nothing more to confirm before dispatch. Bookmark this page to check status any time.`}
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
