/*
  Warnings:

  - You are about to drop the column `studentAssignmentId` on the `Problem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Problem" DROP CONSTRAINT "Problem_studentAssignmentId_fkey";

-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "studentAssignmentId",
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_ProblemToStudentAssignment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProblemToStudentAssignment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProblemToStudentAssignment_B_index" ON "_ProblemToStudentAssignment"("B");

-- AddForeignKey
ALTER TABLE "_ProblemToStudentAssignment" ADD CONSTRAINT "_ProblemToStudentAssignment_A_fkey" FOREIGN KEY ("A") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProblemToStudentAssignment" ADD CONSTRAINT "_ProblemToStudentAssignment_B_fkey" FOREIGN KEY ("B") REFERENCES "StudentAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
