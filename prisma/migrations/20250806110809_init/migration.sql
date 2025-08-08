/*
  Warnings:

  - You are about to drop the column `conversationConversationId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `conversation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_conversationConversationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."conversation" DROP CONSTRAINT "conversation_messageMessageId_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "conversationConversationId";

-- DropTable
DROP TABLE "public"."conversation";

-- CreateTable
CREATE TABLE "public"."Conversation" (
    "conversationId" SERIAL NOT NULL,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "messageMessageId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("conversationId")
);

-- CreateTable
CREATE TABLE "public"."ConversationParticipant" (
    "participantId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("participantId")
);

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_messageMessageId_fkey" FOREIGN KEY ("messageMessageId") REFERENCES "public"."Message"("MessageId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."Conversation"("conversationId") ON DELETE RESTRICT ON UPDATE CASCADE;
