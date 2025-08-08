-- DropForeignKey
ALTER TABLE "public"."Conversation" DROP CONSTRAINT "Conversation_messageMessageId_fkey";

-- AlterTable
ALTER TABLE "public"."Conversation" ALTER COLUMN "messageMessageId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_messageMessageId_fkey" FOREIGN KEY ("messageMessageId") REFERENCES "public"."Message"("MessageId") ON DELETE SET NULL ON UPDATE CASCADE;
