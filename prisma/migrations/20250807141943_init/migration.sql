/*
  Warnings:

  - You are about to drop the `_UserToreaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_UserToreaction" DROP CONSTRAINT "_UserToreaction_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_UserToreaction" DROP CONSTRAINT "_UserToreaction_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."reaction" DROP CONSTRAINT "reaction_messageMessageId_fkey";

-- DropTable
DROP TABLE "public"."_UserToreaction";

-- DropTable
DROP TABLE "public"."reaction";

-- CreateTable
CREATE TABLE "public"."Reaction" (
    "reactionId" SERIAL NOT NULL,
    "emoji" TEXT NOT NULL,
    "userUserId" INTEGER NOT NULL,
    "messageMessageId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("reactionId")
);

-- CreateTable
CREATE TABLE "public"."_ReactionToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ReactionToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ReactionToUser_B_index" ON "public"."_ReactionToUser"("B");

-- AddForeignKey
ALTER TABLE "public"."Reaction" ADD CONSTRAINT "Reaction_messageMessageId_fkey" FOREIGN KEY ("messageMessageId") REFERENCES "public"."Message"("MessageId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ReactionToUser" ADD CONSTRAINT "_ReactionToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Reaction"("reactionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ReactionToUser" ADD CONSTRAINT "_ReactionToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
