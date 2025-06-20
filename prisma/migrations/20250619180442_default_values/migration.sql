/*
  Warnings:

  - Made the column `evaluation` on table `StudentSolution` required. This step will fail if there are existing NULL values in that column.
  - Made the column `recommendedQuestions` on table `StudentSolution` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "StudentSolution" ALTER COLUMN "canvas" SET DEFAULT '{"paths": []}',
ALTER COLUMN "evaluation" SET NOT NULL,
ALTER COLUMN "evaluation" SET DEFAULT 'null',
ALTER COLUMN "recommendedQuestions" SET NOT NULL,
ALTER COLUMN "recommendedQuestions" SET DEFAULT '[]';
