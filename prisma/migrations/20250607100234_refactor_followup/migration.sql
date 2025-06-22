/*
  Warnings:

  - You are about to drop the column `dataSource` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `solution` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Problem` table. All the data in the column will be lost.
  - Added the required column `userId` to the `GroupAssignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `StudentAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GroupAssignment" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "dataSource",
DROP COLUMN "imageUrl",
DROP COLUMN "language",
DROP COLUMN "level",
DROP COLUMN "solution",
DROP COLUMN "type",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StudentAssignment" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StudentGroup" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "StudentSolution" ADD COLUMN     "evaluation" JSONB;

-- AddForeignKey
ALTER TABLE "GroupAssignment" ADD CONSTRAINT "GroupAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAssignment" ADD CONSTRAINT "StudentAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
