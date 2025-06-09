/*
  Warnings:

  - A unique constraint covering the columns `[problemId,studentAssignmentId]` on the table `StudentSolution` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StudentSolution_problemId_studentAssignmentId_key" ON "StudentSolution"("problemId", "studentAssignmentId");
