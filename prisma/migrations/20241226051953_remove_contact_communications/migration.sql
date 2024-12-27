/*
  Warnings:

  - You are about to drop the column `communicationHistory` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `lastContactDate` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `nextFollowupDate` on the `Contact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "communicationHistory",
DROP COLUMN "lastContactDate",
DROP COLUMN "nextFollowupDate";
