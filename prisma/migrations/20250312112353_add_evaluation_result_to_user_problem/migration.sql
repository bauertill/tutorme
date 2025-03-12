/*
  Warnings:

  - You are about to drop the column `isCorrect` on the `UserProblem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProblem" DROP COLUMN "isCorrect",
ADD COLUMN     "evaluation" JSONB;
