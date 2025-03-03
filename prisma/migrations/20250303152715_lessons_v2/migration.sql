/*
  Warnings:

  - You are about to drop the column `lessonIterations` on the `Lesson` table. All the data in the column will be lost.
  - Added the required column `problemId` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `turns` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LessonStatus" ADD VALUE 'PAUSED';
ALTER TYPE "LessonStatus" ADD VALUE 'DONE_WITH_HELP';

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "lessonIterations",
ADD COLUMN     "problemId" TEXT NOT NULL,
ADD COLUMN     "turns" JSONB NOT NULL;

-- CreateIndex
CREATE INDEX "Lesson_problemId_idx" ON "Lesson"("problemId");

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
