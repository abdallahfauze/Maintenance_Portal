import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CONTRACTOR_SESSION_COOKIE, getSessionContractorId } from "@/lib/contractor-auth";
import { contractorLogout } from "@/app/actions/contractor-portal";

export default async function ContractorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const contractorId = await getSessionContractorId(cookieStore.get(CONTRACTOR_SESSION_COOKIE)?.value);
  if (!contractorId) redirect("/contractor/login");

  const contractor = await prisma.contractor.findUnique({ where: { id: contractorId } });
  if (!contractor) redirect("/contractor/login");

  const newJobCount = await prisma.booking.count({
    where: {
      contractorId,
      status: "ASSIGNED",
      assignedAt: { gt: contractor.lastSeenAt ?? new Date(0) },
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-bold text-slate-900">{contractor.name} — Partner Portal</span>
          <Link href="/contractor" className="text-sm text-slate-600 hover:text-slate-900">
            Jobs
            {newJobCount > 0 && (
              <span className="ml-1.5 rounded-full bg-orange-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                {newJobCount} new
              </span>
            )}
          </Link>
          <Link href="/contractor/technicians" className="text-sm text-slate-600 hover:text-slate-900">
            Technicians
          </Link>
        </div>
        <form action={contractorLogout}>
          <button type="submit" className="text-sm text-slate-500 hover:text-slate-900">
            Log out
          </button>
        </form>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
