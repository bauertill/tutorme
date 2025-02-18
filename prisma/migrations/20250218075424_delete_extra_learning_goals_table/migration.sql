/*
  Warnings:

  - You are about to drop the `LearningGoal` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Concept" DROP CONSTRAINT "Concept_goalId_fkey";

-- DropTable
DROP TABLE "LearningGoal";

-- AddForeignKey
ALTER TABLE "Concept" ADD CONSTRAINT "Concept_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
