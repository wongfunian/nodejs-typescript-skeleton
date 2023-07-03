/*
  Warnings:

  - The values [pending] on the enum `MarketingReceiverStatus` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `MarketingReceiver` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `marketingId` on the `MarketingReceiver` table. All the data in the column will be lost.
  - Added the required column `groupId` to the `MarketingReceiver` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MarketingGroupStatus" AS ENUM ('inProgress', 'completed');

-- AlterEnum
BEGIN;
CREATE TYPE "MarketingReceiverStatus_new" AS ENUM ('failed', 'sent');
ALTER TABLE "MarketingReceiver" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "MarketingReceiver" ALTER COLUMN "status" TYPE "MarketingReceiverStatus_new" USING ("status"::text::"MarketingReceiverStatus_new");
ALTER TYPE "MarketingReceiverStatus" RENAME TO "MarketingReceiverStatus_old";
ALTER TYPE "MarketingReceiverStatus_new" RENAME TO "MarketingReceiverStatus";
DROP TYPE "MarketingReceiverStatus_old";
COMMIT;

-- AlterEnum
ALTER TYPE "MarketingStatus" ADD VALUE 'draft';

-- DropForeignKey
ALTER TABLE "MarketingReceiver" DROP CONSTRAINT "MarketingReceiver_marketingId_fkey";

-- AlterTable
ALTER TABLE "MarketingReceiver" DROP CONSTRAINT "MarketingReceiver_pkey",
DROP COLUMN "marketingId",
ADD COLUMN     "groupId" TEXT NOT NULL,
ALTER COLUMN "status" DROP DEFAULT,
ADD CONSTRAINT "MarketingReceiver_pkey" PRIMARY KEY ("email", "groupId");

-- CreateTable
CREATE TABLE "MarketingGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "MarketingGroupStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),
    "marketingId" TEXT,

    CONSTRAINT "MarketingGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MarketingGroup" ADD CONSTRAINT "MarketingGroup_marketingId_fkey" FOREIGN KEY ("marketingId") REFERENCES "Marketing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingReceiver" ADD CONSTRAINT "MarketingReceiver_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MarketingGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
