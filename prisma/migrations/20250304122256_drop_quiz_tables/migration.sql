/*
  Warnings:

  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Quiz` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserQuestionResponse` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "LessonStatus" ADD VALUE 'TODO';

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_quizId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_conceptId_fkey";

-- DropForeignKey
ALTER TABLE "UserQuestionResponse" DROP CONSTRAINT "UserQuestionResponse_conceptId_fkey";

-- DropForeignKey
ALTER TABLE "UserQuestionResponse" DROP CONSTRAINT "UserQuestionResponse_questionId_fkey";

-- DropForeignKey
ALTER TABLE "UserQuestionResponse" DROP CONSTRAINT "UserQuestionResponse_quizId_fkey";

-- DropForeignKey
ALTER TABLE "UserQuestionResponse" DROP CONSTRAINT "UserQuestionResponse_userId_fkey";

-- DropTable
DROP TABLE "Question";

-- DropTable
DROP TABLE "Quiz";

-- DropTable
DROP TABLE "UserQuestionResponse";
