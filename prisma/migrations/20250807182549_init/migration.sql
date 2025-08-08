-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "statusStatusId" INTEGER;

-- CreateTable
CREATE TABLE "public"."Status" (
    "statusId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "content" "public"."ContentType" NOT NULL DEFAULT 'TEXT',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("statusId")
);

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_statusStatusId_fkey" FOREIGN KEY ("statusStatusId") REFERENCES "public"."Status"("statusId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Status" ADD CONSTRAINT "Status_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
