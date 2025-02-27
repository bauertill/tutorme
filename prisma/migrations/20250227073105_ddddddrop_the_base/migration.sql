-- CreateIndex
CREATE INDEX "UserQuestionResponse_userId_idx" ON "UserQuestionResponse"("userId");

-- CreateIndex
CREATE INDEX "UserQuestionResponse_questionId_idx" ON "UserQuestionResponse"("questionId");

-- CreateIndex
CREATE INDEX "UserQuestionResponse_quizId_idx" ON "UserQuestionResponse"("quizId");

-- CreateIndex
CREATE INDEX "UserQuestionResponse_conceptId_idx" ON "UserQuestionResponse"("conceptId");
