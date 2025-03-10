-- CreateEnum
CREATE TYPE "UserProblemStatus" AS ENUM ('INITIAL', 'IN_PROGRESS', 'SOLVED', 'FAILED');

-- CreateTable
CREATE TABLE "UserProblem" (
    "id" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "referenceSolution" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "status" "UserProblemStatus" NOT NULL DEFAULT 'INITIAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserProblem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserProblem_userId_idx" ON "UserProblem"("userId");

-- AddForeignKey
ALTER TABLE "UserProblem" ADD CONSTRAINT "UserProblem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
