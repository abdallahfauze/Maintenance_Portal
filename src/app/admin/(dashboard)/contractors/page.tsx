import { prisma } from "@/lib/prisma";
import { NewContractorForm } from "./new-contractor-form";
import { ActiveToggle } from "./active-toggle";
import {
  OnboardingStatusSelect,
  TierSelect,
  LicenseVerifiedCheckbox,
  InsuranceVerifiedCheckbox,
} from "./onboarding-controls";
import { CommissionRateInput, AgreementControls } from "./commercial-terms-controls";
import { PortalPasswordButton } from "./portal-password-button";
import type { OnboardingStatus, ContractorTier } from "@/lib/constants";

// Admin-only, low-traffic page whose data changes via mutations — always
// read fresh from the database rather than relying on static caching.
export const dynamic = "force-dynamic";

export default async function ContractorsPage() {
  const [contractors, categories, ratings] = await Promise.all([
    prisma.contractor.findMany({
      orderBy: [{ onboardingStatus: "asc" }, { category: "asc" }, { name: "asc" }],
    }),
    prisma.serviceCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true } }),
    prisma.booking.groupBy({
      by: ["contractorId"],
      where: { contractorId: { not: null }, customerRating: { not: null } },
      _avg: { customerRating: true },
      _count: { customerRating: true },
    }),
  ]);
  const ratingByContractor = new Map(
    ratings.map((r) => [r.contractorId as string, { avg: r._avg.customerRating!, count: r._count.customerRating }])
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Contractor Partners</h1>
      <p className="mb-6 text-sm text-slate-500">
        Only contractors marked Active (onboarding) and Active (toggle) are offered for
        assignment on the Bookings page.
      </p>

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Add an applicant</h2>
        <NewContractorForm categories={categories.map((c) => c.name)} />
      </div>

      <div className="space-y-3">
        {contractors.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No contractors yet — add your first applicant above.
          </p>
        )}

        {contractors.map((c) => {
          const rating = ratingByContractor.get(c.id);
          return (
          <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">
                  {c.name}
                  {rating && (
                    <span className="ml-2 text-xs font-normal text-amber-600">
                      ★ {rating.avg.toFixed(1)} ({rating.count})
                    </span>
                  )}
                </p>
                <p className="text-sm text-slate-500">
                  {c.contactPerson ? `${c.contactPerson} · ` : ""}
                  {c.category} · {c.city} · {c.phone}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <TierSelect contractorId={c.id} tier={c.tier as ContractorTier} />
                <OnboardingStatusSelect
                  contractorId={c.id}
                  status={c.onboardingStatus as OnboardingStatus}
                />
                <ActiveToggle contractorId={c.id} active={c.active} />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-500">
                Balady #{c.baladyLicenseNumber || "—"}
                {c.baladyLicenseExpiry && ` (exp. ${c.baladyLicenseExpiry})`}
              </span>
              {c.civilDefenseLicenseNumber && (
                <span className="text-xs text-slate-500">
                  Civil Defense #{c.civilDefenseLicenseNumber}
                </span>
              )}
              <LicenseVerifiedCheckbox contractorId={c.id} verified={c.licenseVerified} />
              <InsuranceVerifiedCheckbox contractorId={c.id} verified={c.insuranceVerified} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3">
              <CommissionRateInput contractorId={c.id} rate={c.commissionRate} />
              <AgreementControls
                contractorId={c.id}
                signed={c.agreementSigned}
                signedDate={c.agreementSignedDate}
              />
            </div>

            <div className="mt-3 border-t border-slate-100 pt-3">
              <PortalPasswordButton contractorId={c.id} hasPassword={!!c.passwordHash} />
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
