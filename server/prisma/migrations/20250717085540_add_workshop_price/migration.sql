/*
  Warnings:

  - You are about to drop the column `amountPaid` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "amountPaid";

-- AlterTable
ALTER TABLE "Workshop" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0;
