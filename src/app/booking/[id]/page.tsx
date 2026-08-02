import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { STATUS_COLORS, STATUS_LABELS, type BookingStatus } from "@/lib/constants";

export default async function BookingStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { contractor: true },
  });

  if (!booking) {
    notFound();
  }

  const status = booking.status as BookingStatus;

  return (
    <div className="mx-auto min-h-screen max-w-xl px-6 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Booking reference</p>
        <p className="mb-4 font-mono text-lg font-semibold text-slate-900">{booking.id}</p>

        <span
          className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[status]}`}
        >
          {STATUS_LABELS[status]}
        </span>

        <dl className="mt-6 space-y-3 text-sm">
          <Row label="Service" value={booking.trade} />
          <Row label="City" value={booking.city} />
          <Row label="Address" value={booking.address} />
          <Row label="Preferred time" value={booking.preferredTime} />
          <Row label="Description" value={booking.description} />
          {booking.contractor && (
            <Row label="Assigned to" value={`${booking.contractor.name} (${booking.contractor.phone})`} />
          )}
        </dl>

        <p className="mt-6 text-xs text-slate-500">
          We&apos;ll contact you at {booking.phone} to confirm the visit and share an upfront
          price estimate. Bookmark this page to check status any time.
        </p>

        <Link href="/" className="mt-6 inline-block text-sm font-medium text-slate-900 underline">
          Book another service
        </Link>
      </div>
    </div>
  );
}

function Row({ label: rowLabel, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
      <dt className="text-slate-500">{rowLabel}</dt>
      <dd className="text-right text-slate-900">{value}</dd>
    </div>
  );
}
