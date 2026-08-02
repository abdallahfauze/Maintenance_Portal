/*
  Warnings:

  - You are about to drop the column `address` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `preferredTime` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `addressDetails` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preferredDate` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preferredTimeSlot` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "address",
DROP COLUMN "preferredTime",
ADD COLUMN     "addressDetails" TEXT NOT NULL,
ADD COLUMN     "locationLat" DOUBLE PRECISION,
ADD COLUMN     "locationLng" DOUBLE PRECISION,
ADD COLUMN     "locationMapLink" TEXT,
ADD COLUMN     "preferredDate" TEXT NOT NULL,
ADD COLUMN     "preferredTimeSlot" TEXT NOT NULL;
