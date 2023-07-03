/*
  Warnings:

  - Added the required column `updatedAt` to the `Marketing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MarketingReceiver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `attachement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Marketing" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMPTZ(6),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "MarketingReceiver" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMPTZ(6),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "attachement" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMPTZ(6),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
