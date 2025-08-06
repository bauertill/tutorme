/*
  Warnings:

  - Added the required column `country` to the `StudentContext` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grade` to the `StudentContext` table without a default value. This is not possible if the table is not empty.
  - Added the required column `textbook` to the `StudentContext` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StudentContext" ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "grade" TEXT NOT NULL,
ADD COLUMN     "nextTestDate" TIMESTAMP(3),
ADD COLUMN     "textbook" TEXT NOT NULL;
