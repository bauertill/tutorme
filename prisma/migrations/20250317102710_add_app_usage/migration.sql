-- CreateTable
CREATE TABLE "AppUsage" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppUsage_fingerprint_key" ON "AppUsage"("fingerprint");

-- CreateIndex
CREATE INDEX "AppUsage_fingerprint_idx" ON "AppUsage"("fingerprint");
