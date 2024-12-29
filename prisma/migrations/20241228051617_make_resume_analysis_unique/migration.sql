/*
  Warnings:

  - A unique constraint covering the columns `[resumeId]` on the table `ResumeAnalysis` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ResumeAnalysis_resumeId_key" ON "ResumeAnalysis"("resumeId");
