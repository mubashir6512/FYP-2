-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "address" TEXT,
ADD COLUMN     "business_name" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "notifications" JSONB;
