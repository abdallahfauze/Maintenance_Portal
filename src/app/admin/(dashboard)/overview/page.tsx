import { prisma } from "@/lib/prisma";
import { BOOKING_FEE_SAR, getSlaStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const bookings = await prisma.booking.findMany({
    include: { contractor: true },
    orderBy: { createdAt: "desc" },
  });

  const totalJobs = bookings.length;
  const requestCount = new Set(bookings.map((b) => b.requestId)).size;

  const completed = bookings.filter((b) => b.status === "COMPLETED");
  const cancelled = bookings.filter((b) => b.status === "CANCELLED");
  const finished = completed.length + cancelled.length;
  const completionRate = finished > 0 ? Math.round((completed.length / finished) * 100) : null;

  const started = bookings.filter((b) => b.startedAt);
  const onTimeCount = started.filter(
    (b) => getSlaStatus(b.preferredDate, b.preferredTimeSlot, b.startedAt) === "on-time"
  ).length;
  const slaRate = started.length > 0 ? Math.round((onTimeCount / started.length) * 100) : null;

  const rated = bookings.filter((b) => b.customerRating != null);
  const avgRating =
    rated.length > 0
      ? rated.reduce((sum, b) => sum + (b.customerRating ?? 0), 0) / rated.length
      : null;

  const totalCommission = bookings.reduce((sum, b) => sum + (b.platformCommission ?? 0), 0);
  const totalBookingFees = requestCount * BOOKING_FEE_SAR;
  const platformRevenue = totalCommission + totalBookingFees;
  const totalPayouts = bookings.reduce((sum, b) => sum + (b.contractorPayout ?? 0), 0);

  const escalatedOpen = bookings.filter((b) => b.isEscalated).length;

  // Per-contractor leaderboard
  const byContractor = new Map<
    string,
    { name: string; category: string; tier: string; jobs: number; completed: number; started: number; onTime: number; ratingSum: number; ratingCount: number }
  >();
  for (const b of bookings) {
    if (!b.contractor) continue;
    const key = b.contractor.id;
    const entry = byContractor.get(key) ?? {
      name: b.contractor.name,
      category: b.contractor.category,
      tier: b.contractor.tier,
      jobs: 0,
      completed: 0,
      started: 0,
      onTime: 0,
      ratingSum: 0,
      ratingCount: 0,
    };
    entry.jobs += 1;
    if (b.status === "COMPLETED") entry.completed += 1;
    if (b.startedAt) {
      entry.started += 1;
      if (getSlaStatus(b.preferredDate, b.preferredTimeSlot, b.startedAt) === "on-time") {
        entry.onTime += 1;
      }
    }
    if (b.customerRating != null) {
      entry.ratingSum += b.customerRating;
      entry.ratingCount += 1;
    }
    byContractor.set(key, entry);
  }
  const leaderboard = [...byContractor.values()].sort((a, b) => b.jobs - a.jobs);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Overview</h1>
      <p className="mb-6 text-sm text-slate-500">
        {requestCount} request{requestCount === 1 ? "" : "s"} · {totalJobs} job
        {totalJobs === 1 ? "" : "s"} total
      </p>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          label="Completion rate"
          value={completionRate != null ? `${completionRate}%` : "—"}
          hint={`of ${finished} finished job${finished === 1 ? "" : "s"}`}
        />
        <StatTile
          label="On-time (SLA)"
          value={slaRate != null ? `${slaRate}%` : "—"}
          hint={`of ${started.length} started job${started.length === 1 ? "" : "s"}`}
        />
        <StatTile
          label="Avg. customer rating"
          value={avgRating != null ? `★ ${avgRating.toFixed(1)}` : "—"}
        />
        <StatTile label="Open escalations" value={String(escalatedOpen)} />
        <StatTile label="Platform revenue" value={`${platformRevenue} SAR`} />
        <StatTile label="  · commission" value={`${totalCommission} SAR`} sub />
        <StatTile label="  · booking fees" value={`${totalBookingFees} SAR`} sub />
        <StatTile label="Contractor payouts" value={`${totalPayouts} SAR`} />
      </div>

      <h2 className="mb-3 text-lg font-semibold text-slate-900">Contractor leaderboard</h2>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Contractor</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Jobs</th>
              <th className="px-4 py-3">Completed</th>
              <th className="px-4 py-3">On-time</th>
              <th className="px-4 py-3">Rating</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((c) => (
              <tr key={c.name} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                <td className="px-4 py-3">{c.category}</td>
                <td className="px-4 py-3">{c.tier}</td>
                <td className="px-4 py-3">{c.jobs}</td>
                <td className="px-4 py-3">{c.completed}</td>
                <td className="px-4 py-3">
                  {c.started > 0 ? `${Math.round((c.onTime / c.started) * 100)}%` : "—"}
                </td>
                <td className="px-4 py-3">
                  {c.ratingCount > 0 ? `★ ${(c.ratingSum / c.ratingCount).toFixed(1)} (${c.ratingCount})` : "—"}
                </td>
              </tr>
            ))}
            {leaderboard.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  No jobs assigned yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  hint,
  sub,
}: {
  label: string;
  value: string;
  hint?: string;
  sub?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${sub ? "opacity-70" : ""}`}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
