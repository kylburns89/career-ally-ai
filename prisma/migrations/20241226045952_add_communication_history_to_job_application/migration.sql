-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "communicationHistory" JSONB[] DEFAULT ARRAY[]::JSONB[];
