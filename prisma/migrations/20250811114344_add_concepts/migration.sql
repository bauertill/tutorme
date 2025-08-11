-- CreateTable
CREATE TABLE "Concept" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "parentConceptId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Concept_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Concept" ADD CONSTRAINT "Concept_parentConceptId_fkey" FOREIGN KEY ("parentConceptId") REFERENCES "Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;
