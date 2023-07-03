/*
  Warnings:

  - The values [draft,completed] on the enum `MarketingStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MarketingStatus_new" AS ENUM ('active', 'inactive');
ALTER TABLE "Marketing" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Marketing" ALTER COLUMN "status" TYPE "MarketingStatus_new" USING ("status"::text::"MarketingStatus_new");
ALTER TYPE "MarketingStatus" RENAME TO "MarketingStatus_old";
ALTER TYPE "MarketingStatus_new" RENAME TO "MarketingStatus";
DROP TYPE "MarketingStatus_old";
ALTER TABLE "Marketing" ALTER COLUMN "status" SET DEFAULT 'active';
COMMIT;

-- AlterTable
ALTER TABLE "Marketing" ALTER COLUMN "status" SET DEFAULT 'active';
