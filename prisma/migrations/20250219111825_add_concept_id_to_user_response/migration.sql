/*
  Warnings:

  - Added the required column `conceptId` to the `UserQuestionResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quizId` to the `UserQuestionResponse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserQuestionResponse" ADD COLUMN     "conceptId" TEXT NOT NULL,
ADD COLUMN     "quizId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "UserQuestionResponse_quizId_idx" ON "UserQuestionResponse"("quizId");

-- CreateIndex
CREATE INDEX "UserQuestionResponse_conceptId_idx" ON "UserQuestionResponse"("conceptId");

-- AddForeignKey
ALTER TABLE "UserQuestionResponse" ADD CONSTRAINT "UserQuestionResponse_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestionResponse" ADD CONSTRAINT "UserQuestionResponse_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
