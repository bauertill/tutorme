-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('ACTIVE', 'DONE');

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "status" "LessonStatus" NOT NULL DEFAULT 'ACTIVE';
