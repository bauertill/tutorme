-- CreateEnum
CREATE TYPE "Language" AS ENUM ('de', 'en');

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'en';
