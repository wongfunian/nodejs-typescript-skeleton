/*
  Warnings:

  - The primary key for the `ActivityLogs` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "ActivityLogs" DROP CONSTRAINT "ActivityLogs_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ActivityLogs_pkey" PRIMARY KEY ("id");
