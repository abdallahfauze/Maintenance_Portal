-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "laborUnits" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "ServiceAccessory" ADD COLUMN     "laborBatchSize" INTEGER NOT NULL DEFAULT 1;
