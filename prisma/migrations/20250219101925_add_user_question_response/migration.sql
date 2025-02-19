-- CreateTable
CREATE TABLE "UserQuestionResponse" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuestionResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserQuestionResponse_userId_idx" ON "UserQuestionResponse"("userId");

-- CreateIndex
CREATE INDEX "UserQuestionResponse_questionId_idx" ON "UserQuestionResponse"("questionId");

-- AddForeignKey
ALTER TABLE "UserQuestionResponse" ADD CONSTRAINT "UserQuestionResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestionResponse" ADD CONSTRAINT "UserQuestionResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
