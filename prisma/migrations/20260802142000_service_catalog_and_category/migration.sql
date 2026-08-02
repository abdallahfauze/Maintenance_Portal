-- This migration reshapes Booking/Contractor around the new service catalog
-- (category/subcategory/accessory/quality-tier) instead of a flat "trade"
-- string. Since this is Stage 0 pilot/test data (no real customer bookings
-- yet), existing rows are cleared rather than backfilled — the seed script
-- repopulates contractors immediately after.
DELETE FROM "Booking";
DELETE FROM "Contractor";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "trade",
ADD COLUMN     "accessory" TEXT NOT NULL,
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "qualityTier" TEXT NOT NULL,
ADD COLUMN     "selectedBrand" TEXT NOT NULL,
ADD COLUMN     "selectedPrice" INTEGER NOT NULL,
ADD COLUMN     "subcategory" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Contractor" DROP COLUMN "trade",
ADD COLUMN     "category" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "gradient" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceSubcategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "ServiceSubcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceAccessory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "lowBrand" TEXT NOT NULL,
    "lowPrice" INTEGER NOT NULL,
    "mediumBrand" TEXT NOT NULL,
    "mediumPrice" INTEGER NOT NULL,
    "highBrand" TEXT NOT NULL,
    "highPrice" INTEGER NOT NULL,

    CONSTRAINT "ServiceAccessory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_name_key" ON "ServiceCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceSubcategory_categoryId_name_key" ON "ServiceSubcategory"("categoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceAccessory_subcategoryId_name_key" ON "ServiceAccessory"("subcategoryId", "name");

-- AddForeignKey
ALTER TABLE "ServiceSubcategory" ADD CONSTRAINT "ServiceSubcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAccessory" ADD CONSTRAINT "ServiceAccessory_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "ServiceSubcategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
