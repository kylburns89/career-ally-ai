-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "communication_history" JSONB[],
ADD COLUMN     "last_contact_date" TIMESTAMP(3),
ADD COLUMN     "next_followup_date" TIMESTAMP(3),
ADD COLUMN     "relationship_score" INTEGER DEFAULT 50;
