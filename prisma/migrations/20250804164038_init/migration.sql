-- CreateEnum
CREATE TYPE "public"."contentType" AS ENUM ('IMAGE', 'VIDEO', 'TEXT');

-- CreateTable
CREATE TABLE "public"."User" (
    "userId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "refreshToken" TEXT NOT NULL,
    "conversationConversationId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."conversation" (
    "conversationId" SERIAL NOT NULL,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "messageMessageId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("conversationId")
);

-- CreateTable
CREATE TABLE "public"."reaction" (
    "reactionId" SERIAL NOT NULL,
    "emoji" TEXT NOT NULL,
    "userUserId" INTEGER NOT NULL,
    "messageMessageId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reaction_pkey" PRIMARY KEY ("reactionId")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "MessageId" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "imageOrVideoUrl" TEXT NOT NULL,
    "userUserId" INTEGER NOT NULL,
    "contentType" "public"."contentType" NOT NULL DEFAULT 'TEXT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("MessageId")
);

-- CreateTable
CREATE TABLE "public"."_UserToreaction" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserToreaction_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "_UserToreaction_B_index" ON "public"."_UserToreaction"("B");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_conversationConversationId_fkey" FOREIGN KEY ("conversationConversationId") REFERENCES "public"."conversation"("conversationId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversation" ADD CONSTRAINT "conversation_messageMessageId_fkey" FOREIGN KEY ("messageMessageId") REFERENCES "public"."Message"("MessageId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reaction" ADD CONSTRAINT "reaction_messageMessageId_fkey" FOREIGN KEY ("messageMessageId") REFERENCES "public"."Message"("MessageId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_userUserId_fkey" FOREIGN KEY ("userUserId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserToreaction" ADD CONSTRAINT "_UserToreaction_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserToreaction" ADD CONSTRAINT "_UserToreaction_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."reaction"("reactionId") ON DELETE CASCADE ON UPDATE CASCADE;
