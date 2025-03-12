/*
  Warnings:

  - Made the column `canvas` on table `UserProblem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserProblem" ALTER COLUMN "canvas" SET NOT NULL;
