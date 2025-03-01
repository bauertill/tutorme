-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL,
    "dataset" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "vector" vector(3072),

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);
