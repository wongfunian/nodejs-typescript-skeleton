/*
  Warnings:

  - The primary key for the `Media` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Media" DROP CONSTRAINT "Media_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Media_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Media_id_seq";

-- CreateTable
CREATE TABLE "Marketing" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "Marketing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachement" (
    "id" TEXT NOT NULL,
    "marketingId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,

    CONSTRAINT "attachement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingReceiver" (
    "email" TEXT NOT NULL,
    "marketingId" TEXT NOT NULL,

    CONSTRAINT "MarketingReceiver_pkey" PRIMARY KEY ("email","marketingId")
);

-- AddForeignKey
ALTER TABLE "attachement" ADD CONSTRAINT "attachement_marketingId_fkey" FOREIGN KEY ("marketingId") REFERENCES "Marketing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachement" ADD CONSTRAINT "attachement_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
