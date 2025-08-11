-- CreateTable
CREATE TABLE "StudentConcept" (
    "id" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "skillLevel" TEXT NOT NULL DEFAULT 'unknown',
    "teacherReport" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentConcept_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StudentConcept" ADD CONSTRAINT "StudentConcept_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentConcept" ADD CONSTRAINT "StudentConcept_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
