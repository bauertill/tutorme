-- CreateEnum
CREATE TYPE "GenerationStatus" AS ENUM ('GENERATING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "generationStatus" "GenerationStatus" NOT NULL DEFAULT 'GENERATING';

-- DropEnum
DROP TYPE "QuizStatus";
