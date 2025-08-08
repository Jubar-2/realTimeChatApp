-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "receiverUser" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_receiverUser_fkey" FOREIGN KEY ("receiverUser") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
