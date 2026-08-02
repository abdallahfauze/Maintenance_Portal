import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CONTRACTOR_SESSION_COOKIE, getSessionContractorId } from "@/lib/contractor-auth";
import { NewTechnicianForm } from "./new-technician-form";
import { TechnicianActiveToggle } from "./active-toggle";

export const dynamic = "force-dynamic";

export default async function TechniciansPage() {
  const cookieStore = await cookies();
  const contractorId = await getSessionContractorId(cookieStore.get(CONTRACTOR_SESSION_COOKIE)?.value);
  if (!contractorId) redirect("/contractor/login");

  const technicians = await prisma.technician.findMany({
    where: { contractorId },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Your Technicians</h1>
      <p className="mb-6 text-sm text-slate-500">
        Your own field staff — assign them to jobs from the Jobs page. Only active technicians
        show up there.
      </p>

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Add a technician</h2>
        <NewTechnicianForm />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {technicians.map((t) => (
              <tr key={t.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">{t.name}</td>
                <td className="px-4 py-3">{t.phone}</td>
                <td className="px-4 py-3">
                  <TechnicianActiveToggle technicianId={t.id} active={t.active} />
                </td>
              </tr>
            ))}
            {technicians.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                  No technicians yet — add your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
