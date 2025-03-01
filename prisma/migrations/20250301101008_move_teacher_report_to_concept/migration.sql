/*
  Warnings:

  - You are about to drop the column `teacherReport` on the `Quiz` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Concept" ADD COLUMN     "teacherReport" TEXT;

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "teacherReport";
