/*
  Warnings:

  - You are about to drop the column `relationshipScore` on the `Contact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "relationshipScore",
ADD COLUMN     "relationship_score" INTEGER DEFAULT 50;
