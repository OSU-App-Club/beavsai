-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "course_materials" ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE';
