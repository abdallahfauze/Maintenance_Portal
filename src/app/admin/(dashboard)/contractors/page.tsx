import { prisma } from "@/lib/prisma";
import { NewContractorForm } from "./new-contractor-form";
import { ActiveToggle } from "./active-toggle";

// Admin-only, low-traffic page whose data changes via mutations — always
// read fresh from the database rather than relying on static caching.
export const dynamic = "force-dynamic";

export default async function ContractorsPage() {
  const [contractors, categories] = await Promise.all([
    prisma.contractor.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.serviceCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true } }),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Contractor Partners</h1>
      <p className="mb-6 text-sm text-slate-500">
        Only active contractors are offered for assignment on the Bookings page.
      </p>

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Add a contractor</h2>
        <NewContractorForm categories={categories.map((c) => c.name)} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {contractors.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                <td className="px-4 py-3">{c.category}</td>
                <td className="px-4 py-3">{c.city}</td>
                <td className="px-4 py-3">{c.phone}</td>
                <td className="px-4 py-3">
                  <ActiveToggle contractorId={c.id} active={c.active} />
                </td>
              </tr>
            ))}
            {contractors.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  No contractors yet — add your first partner above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
