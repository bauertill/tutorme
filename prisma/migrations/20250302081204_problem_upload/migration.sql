/*
  Warnings:

  - You are about to drop the column `dataset` on the `Problem` table. All the data in the column will be lost.
  - Added the required column `dataSource` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `problemUploadId` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProblemUploadStatus" AS ENUM ('PENDING', 'SUCCESS', 'ERROR', 'CANCELLED');

-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "dataset",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dataSource" TEXT NOT NULL,
ADD COLUMN     "problemUploadId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ProblemUpload" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "nRecords" INTEGER NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" "ProblemUploadStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProblemUpload_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_problemUploadId_fkey" FOREIGN KEY ("problemUploadId") REFERENCES "ProblemUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
