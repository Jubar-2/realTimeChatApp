-- AlterTable
ALTER TABLE "public"."Message" ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "imageOrVideoUrl" DROP NOT NULL;
