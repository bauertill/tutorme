-- AlterTable
ALTER TABLE "StudentAssignment" ADD COLUMN     "studentConceptId" TEXT;

-- AddForeignKey
ALTER TABLE "StudentAssignment" ADD CONSTRAINT "StudentAssignment_studentConceptId_fkey" FOREIGN KEY ("studentConceptId") REFERENCES "StudentConcept"("id") ON DELETE SET NULL ON UPDATE CASCADE;
