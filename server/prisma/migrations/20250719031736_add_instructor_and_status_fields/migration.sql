-- AlterTable
ALTER TABLE "Workshop" ADD COLUMN     "instructor" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Active';
