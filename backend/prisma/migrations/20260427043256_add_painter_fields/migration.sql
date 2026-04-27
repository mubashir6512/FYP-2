-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "availability" TEXT NOT NULL DEFAULT 'Available',
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];
