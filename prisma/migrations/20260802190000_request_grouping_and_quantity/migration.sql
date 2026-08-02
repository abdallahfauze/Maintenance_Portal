-- Stage 0 test data only (no real customers yet) — safe to clear before
-- adding the new NOT NULL requestId column (no sensible default value to
-- backfill existing rows with).
DELETE FROM "Booking";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "requestId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Booking_requestId_idx" ON "Booking"("requestId");
