-- CreateEnum
CREATE TYPE "MarketingStatus" AS ENUM ('draft', 'completed');

-- CreateEnum
CREATE TYPE "MarketingReceiverStatus" AS ENUM ('pending', 'failed', 'sent');

-- AlterTable
ALTER TABLE "Marketing" ADD COLUMN     "status" "MarketingStatus" NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "MarketingReceiver" ADD COLUMN     "status" "MarketingReceiverStatus" NOT NULL DEFAULT 'pending';

-- AddForeignKey
ALTER TABLE "MarketingReceiver" ADD CONSTRAINT "MarketingReceiver_marketingId_fkey" FOREIGN KEY ("marketingId") REFERENCES "Marketing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
