-- CreateTable
CREATE TABLE "Departments" (
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

    CONSTRAINT "Departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staffs" (
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

    CONSTRAINT "Staffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clients" (
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

    CONSTRAINT "Clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientPersonInCharge" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,

    CONSTRAINT "ClientPersonInCharge_pkey" PRIMARY KEY ("clientId","staffId")
);

-- CreateTable
CREATE TABLE "Agents" (
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

    CONSTRAINT "Agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentPersonInCharge" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "agentId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,

    CONSTRAINT "AgentPersonInCharge_pkey" PRIMARY KEY ("agentId","staffId")
);

-- CreateTable
CREATE TABLE "ActivityLogs" (
    "id" UUID NOT NULL,
    "targetId" VARCHAR(255) NOT NULL,
    "executorName" VARCHAR(255) NOT NULL,
    "action" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "reason" VARCHAR(255) DEFAULT '',
    "data" JSON,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "staffId" TEXT,

    CONSTRAINT "ActivityLogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staffs_staffId_key" ON "Staffs"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "staffs_email_deleted_at" ON "Staffs"("email", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "staffs_username_deleted_at" ON "Staffs"("username", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Clients_clientId_key" ON "Clients"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_deleted_at" ON "Clients"("email", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "clients_username_deleted_at" ON "Clients"("username", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Agents_agentId_key" ON "Agents"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "agents_email_deleted_at" ON "Agents"("email", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "agents_username_deleted_at" ON "Agents"("username", "deletedAt");

-- AddForeignKey
ALTER TABLE "Staffs" ADD CONSTRAINT "Staffs_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPersonInCharge" ADD CONSTRAINT "ClientPersonInCharge_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPersonInCharge" ADD CONSTRAINT "ClientPersonInCharge_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staffs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPersonInCharge" ADD CONSTRAINT "AgentPersonInCharge_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPersonInCharge" ADD CONSTRAINT "AgentPersonInCharge_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staffs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLogs" ADD CONSTRAINT "ActivityLogs_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
