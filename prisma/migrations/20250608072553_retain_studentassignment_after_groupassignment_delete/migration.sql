-- DropForeignKey
ALTER TABLE "StudentAssignment" DROP CONSTRAINT "StudentAssignment_groupAssignmentId_fkey";

-- AddForeignKey
ALTER TABLE "StudentAssignment" ADD CONSTRAINT "StudentAssignment_groupAssignmentId_fkey" FOREIGN KEY ("groupAssignmentId") REFERENCES "GroupAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
