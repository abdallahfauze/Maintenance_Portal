-- AlterTable
ALTER TABLE "Contractor" ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "baladyLicenseExpiry" TEXT,
ADD COLUMN     "baladyLicenseNumber" TEXT,
ADD COLUMN     "civilDefenseLicenseNumber" TEXT,
ADD COLUMN     "contactPerson" TEXT,
ADD COLUMN     "insuranceVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "licenseVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingStatus" TEXT NOT NULL DEFAULT 'APPLIED',
ADD COLUMN     "tier" TEXT NOT NULL DEFAULT 'Bronze';

-- Any contractor that already existed before this migration was already
-- being offered for job assignment under the old model — preserve that by
-- backfilling them as an already-vetted Active partner. New contractors
-- created from here on start at the schema default (APPLIED, unverified)
-- and go through the onboarding funnel explicitly.
UPDATE "Contractor" SET "onboardingStatus" = 'ACTIVE', "licenseVerified" = true, "insuranceVerified" = true;
