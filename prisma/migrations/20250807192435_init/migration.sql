/*
  Warnings:

  - You are about to drop the column `userUserId` on the `Status` table. All the data in the column will be lost.
  - Changed the type of `content` on the `Status` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Status" DROP COLUMN "userUserId",
ADD COLUMN     "contentType" "public"."ContentType" NOT NULL DEFAULT 'TEXT',
DROP COLUMN "content",
ADD COLUMN     "content" TEXT NOT NULL;
