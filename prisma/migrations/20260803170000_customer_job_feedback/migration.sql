-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "customerFeedback" TEXT,
ADD COLUMN     "customerRating" INTEGER,
ADD COLUMN     "feedbackSubmittedAt" TIMESTAMP(3);
