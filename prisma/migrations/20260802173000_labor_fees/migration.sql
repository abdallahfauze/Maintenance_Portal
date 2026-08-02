-- Stage 0 test data only (no real customers yet) — safe to clear before
-- adding the new NOT NULL columns. ServiceCategory/Subcategory/Accessory are
-- cleared too so the build-time seed re-runs and backfills laborFee from the
-- updated prisma/data/catalog.json.
DELETE FROM "Booking";
DELETE FROM "ServiceAccessory";
DELETE FROM "ServiceSubcategory";
DELETE FROM "ServiceCategory";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "laborFee" INTEGER NOT NULL,
ADD COLUMN     "totalPrice" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ServiceAccessory" ADD COLUMN     "laborFee" INTEGER NOT NULL;
