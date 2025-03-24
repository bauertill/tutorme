/*
  Warnings:

  - Added the required column `problemNumber` to the `UserProblem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserProblem" ADD COLUMN "problemNumber" TEXT;

-- UpdateTable (set default for existing records)
UPDATE "UserProblem" SET "problemNumber" = '' WHERE "problemNumber" IS NULL;

-- Make column required
ALTER TABLE "UserProblem" ALTER COLUMN "problemNumber" SET NOT NULL;
