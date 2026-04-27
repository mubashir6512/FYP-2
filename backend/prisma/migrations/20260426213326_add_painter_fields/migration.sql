-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "experience" INTEGER DEFAULT 0,
ADD COLUMN     "hourly_rate" DECIMAL DEFAULT 0,
ADD COLUMN     "specialization" TEXT;
