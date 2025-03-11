/*
  Warnings:

  - You are about to drop the `Concept` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Goal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lesson` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Concept" DROP CONSTRAINT "Concept_goalId_fkey";

-- DropForeignKey
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_userId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_conceptId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_goalId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_problemId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_userId_fkey";

-- DropTable
DROP TABLE "Concept";

-- DropTable
DROP TABLE "Goal";

-- DropTable
DROP TABLE "Lesson";

-- DropEnum
DROP TYPE "Difficulty";

-- DropEnum
DROP TYPE "GenerationStatus";

-- DropEnum
DROP TYPE "LessonStatus";

-- DropEnum
DROP TYPE "Mastery";
