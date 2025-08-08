/*
  Warnings:

  - You are about to drop the column `studentId` on the `StudentContext` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `StudentContext` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `StudentContext` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "StudentContext" DROP CONSTRAINT "StudentContext_studentId_fkey";

-- DropIndex
DROP INDEX "StudentContext_studentId_key";

-- AlterTable
ALTER TABLE "StudentContext" DROP COLUMN "studentId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "StudentContext_userId_key" ON "StudentContext"("userId");

-- AddForeignKey
ALTER TABLE "StudentContext" ADD CONSTRAINT "StudentContext_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
