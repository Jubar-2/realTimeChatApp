/*
  Warnings:

  - The `contentType` column on the `Message` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('IMAGE', 'VIDEO', 'TEXT');

-- AlterTable
ALTER TABLE "public"."Message" DROP COLUMN "contentType",
ADD COLUMN     "contentType" "public"."ContentType" NOT NULL DEFAULT 'TEXT';

-- DropEnum
DROP TYPE "public"."contentType";
