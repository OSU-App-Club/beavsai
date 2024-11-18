-- AlterTable
ALTER TABLE "course_materials" ADD COLUMN     "documentIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
