-- AlterTable
ALTER TABLE "Contractor" ADD COLUMN     "agreementSigned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "agreementSignedDate" TEXT,
ADD COLUMN     "commissionRate" INTEGER NOT NULL DEFAULT 18;
