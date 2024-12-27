/*
  Warnings:

  - You are about to drop the column `communication_history` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `last_contact_date` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `next_followup_date` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `relationship_score` on the `Contact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "communication_history",
DROP COLUMN "last_contact_date",
DROP COLUMN "next_followup_date",
DROP COLUMN "relationship_score",
ADD COLUMN     "communicationHistory" JSONB[],
ADD COLUMN     "lastContactDate" TIMESTAMP(3),
ADD COLUMN     "nextFollowupDate" TIMESTAMP(3),
ADD COLUMN     "relationshipScore" INTEGER DEFAULT 50;
