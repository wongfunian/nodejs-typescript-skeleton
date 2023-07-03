/*
  Warnings:

  - You are about to drop the `Agents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Clients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Departments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Staffs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ActivityLogs" DROP CONSTRAINT "ActivityLogs_staffId_fkey";

-- DropForeignKey
ALTER TABLE "AgentPersonInCharge" DROP CONSTRAINT "AgentPersonInCharge_agentId_fkey";

-- DropForeignKey
ALTER TABLE "AgentPersonInCharge" DROP CONSTRAINT "AgentPersonInCharge_staffId_fkey";

-- DropForeignKey
ALTER TABLE "ClientPersonInCharge" DROP CONSTRAINT "ClientPersonInCharge_clientId_fkey";

-- DropForeignKey
ALTER TABLE "ClientPersonInCharge" DROP CONSTRAINT "ClientPersonInCharge_staffId_fkey";

-- DropForeignKey
ALTER TABLE "Staffs" DROP CONSTRAINT "Staffs_departmentId_fkey";

-- DropTable
DROP TABLE "Agents";

-- DropTable
DROP TABLE "Clients";

-- DropTable
DROP TABLE "Departments";

-- DropTable
DROP TABLE "Staffs";

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "superAdmin" BOOLEAN NOT NULL DEFAULT false,
    "STAFF_VIEW" BOOLEAN NOT NULL DEFAULT false,
    "STAFF_CREATE" BOOLEAN NOT NULL DEFAULT false,
    "STAFF_UPDATE" BOOLEAN NOT NULL DEFAULT false,
    "STAFF_DELETE" BOOLEAN NOT NULL DEFAULT false,
    "DEPARTMENT_VIEW" BOOLEAN NOT NULL DEFAULT false,
    "DEPARTMENT_CREATE" BOOLEAN NOT NULL DEFAULT false,
    "DEPARTMENT_UPDATE" BOOLEAN NOT NULL DEFAULT false,
    "DEPARTMENT_DELETE" BOOLEAN NOT NULL DEFAULT false,
    "CLIENT_VIEW" BOOLEAN NOT NULL DEFAULT false,
    "CLIENT_CREATE" BOOLEAN NOT NULL DEFAULT false,
    "CLIENT_UPDATE" BOOLEAN NOT NULL DEFAULT false,
    "CLIENT_DELETE" BOOLEAN NOT NULL DEFAULT false,
    "CLIENT_CREDENTIAL" BOOLEAN NOT NULL DEFAULT false,
    "AGENT_VIEW" BOOLEAN NOT NULL DEFAULT false,
    "AGENT_CREATE" BOOLEAN NOT NULL DEFAULT false,
    "AGENT_UPDATE" BOOLEAN NOT NULL DEFAULT false,
    "AGENT_DELETE" BOOLEAN NOT NULL DEFAULT false,
    "ACTIVITY_LOG" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "staffId" SERIAL NOT NULL,
    "chineseName" VARCHAR(255),
    "englishName" VARCHAR(255) NOT NULL,
    "nickname" VARCHAR(255) NOT NULL,
    "dateOfBirth" TIMESTAMPTZ(6) NOT NULL,
    "nationality" VARCHAR(255) NOT NULL,
    "documentNumber" VARCHAR(255) NOT NULL,
    "dateOfJoin" TIMESTAMPTZ(6) NOT NULL,
    "position" VARCHAR(255) NOT NULL,
    "directLine" VARCHAR(255),
    "mobile1" VARCHAR(255) NOT NULL,
    "mobile2" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "remarks" VARCHAR(255),
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255),
    "lastActive" TIMESTAMPTZ(6) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "token" VARCHAR(255),
    "tokenExpiredAt" TIMESTAMPTZ(6),
    "resetToken" VARCHAR(255),
    "resetTokenExpiredAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),
    "departmentId" TEXT NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "clientId" SERIAL NOT NULL,
    "companyName" VARCHAR(255),
    "address" VARCHAR(255),
    "website" VARCHAR(255),
    "industry" VARCHAR(255),
    "contactPerson" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255),
    "mobile" VARCHAR(255),
    "directLine" VARCHAR(255),
    "phone" VARCHAR(255),
    "email" VARCHAR(255),
    "referredBy" VARCHAR(255),
    "remarks" TEXT,
    "username" VARCHAR(255),
    "password" VARCHAR(255),
    "lastActive" TIMESTAMPTZ(6),
    "portalExpiryDate" TIMESTAMPTZ(6),
    "token" VARCHAR(255),
    "tokenExpiredAt" TIMESTAMPTZ(6),
    "resetToken" VARCHAR(255),
    "resetTokenExpiredAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "agentId" SERIAL NOT NULL,
    "companyName" VARCHAR(255),
    "address" VARCHAR(255),
    "website" VARCHAR(255),
    "industry" VARCHAR(255),
    "contactPerson" VARCHAR(255),
    "title" VARCHAR(255),
    "mobile" VARCHAR(255),
    "directLine" VARCHAR(255),
    "phone" VARCHAR(255),
    "email" VARCHAR(255),
    "referredBy" VARCHAR(255),
    "remarks" TEXT,
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255),
    "lastActive" TIMESTAMPTZ(6) NOT NULL,
    "portalExpiryDate" TIMESTAMPTZ(6),
    "token" VARCHAR(255),
    "tokenExpiredAt" TIMESTAMPTZ(6),
    "resetToken" VARCHAR(255),
    "resetTokenExpiredAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_staffId_key" ON "Staff"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "staffs_email_deleted_at" ON "Staff"("email", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "staffs_username_deleted_at" ON "Staff"("username", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Client_clientId_key" ON "Client"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_deleted_at" ON "Client"("email", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "clients_username_deleted_at" ON "Client"("username", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_agentId_key" ON "Agent"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "agents_email_deleted_at" ON "Agent"("email", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "agents_username_deleted_at" ON "Agent"("username", "deletedAt");

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPersonInCharge" ADD CONSTRAINT "ClientPersonInCharge_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPersonInCharge" ADD CONSTRAINT "ClientPersonInCharge_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPersonInCharge" ADD CONSTRAINT "AgentPersonInCharge_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPersonInCharge" ADD CONSTRAINT "AgentPersonInCharge_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLogs" ADD CONSTRAINT "ActivityLogs_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
