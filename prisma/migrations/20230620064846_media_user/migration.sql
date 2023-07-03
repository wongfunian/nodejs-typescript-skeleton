/*
  Warnings:

  - You are about to drop the column `staffId` on the `Media` table. All the data in the column will be lost.
  - Added the required column `userType` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('AGENT', 'CLIENT', 'USER', 'PUBLIC');

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_staffId_fkey";

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "staffId",
ADD COLUMN     "uploadedBy" TEXT,
ADD COLUMN     "userId" VARCHAR(255),
ADD COLUMN     "userType" "UserType" NOT NULL;
