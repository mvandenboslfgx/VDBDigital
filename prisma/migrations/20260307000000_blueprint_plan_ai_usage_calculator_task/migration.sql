-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('todo', 'in_progress', 'done', 'cancelled');

-- CreateEnum
CREATE TYPE "CalculatorType" AS ENUM ('roi', 'breakEven', 'priceIncrease', 'subscriptionVsOneTime', 'freelancerRate', 'discountImpact', 'financeCheck');

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "credits" INTEGER,
    "features" JSONB DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");
CREATE INDEX "Plan_active_idx" ON "Plan"("active");

-- AlterTable User
ALTER TABLE "User" ADD COLUMN "planId" TEXT;
ALTER TABLE "User" ADD COLUMN "credits" INTEGER;
ALTER TABLE "User" ADD COLUMN "companyName" TEXT;
ALTER TABLE "User" ADD COLUMN "industry" TEXT;

-- AlterTable Lead
ALTER TABLE "Lead" ADD COLUMN "leadScore" INTEGER DEFAULT 0;

CREATE INDEX "Lead_leadScore_idx" ON "Lead"("leadScore");

-- CreateTable AIUsage
CREATE TABLE "AIUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "tool" TEXT NOT NULL,
    "tokens" INTEGER,
    "creditsUsed" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AIUsage_userId_idx" ON "AIUsage"("userId");
CREATE INDEX "AIUsage_tool_idx" ON "AIUsage"("tool");
CREATE INDEX "AIUsage_createdAt_idx" ON "AIUsage"("createdAt");

-- CreateTable CalculatorResult
CREATE TABLE "CalculatorResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" "CalculatorType" NOT NULL,
    "inputs" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalculatorResult_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CalculatorResult_userId_idx" ON "CalculatorResult"("userId");
CREATE INDEX "CalculatorResult_type_idx" ON "CalculatorResult"("type");
CREATE INDEX "CalculatorResult_createdAt_idx" ON "CalculatorResult"("createdAt");

-- CreateTable Task
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'todo',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- AlterTable AnalyticsEvent
ALTER TABLE "AnalyticsEvent" ADD COLUMN "userId" TEXT;
ALTER TABLE "AnalyticsEvent" ADD COLUMN "metadata" JSONB DEFAULT '{}';

CREATE INDEX "AnalyticsEvent_userId_idx" ON "AnalyticsEvent"("userId");

-- AddForeignKey User -> Plan
ALTER TABLE "User" ADD CONSTRAINT "User_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "User_planId_idx" ON "User"("planId");

-- AddForeignKey AIUsage -> User
ALTER TABLE "AIUsage" ADD CONSTRAINT "AIUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey CalculatorResult -> User
ALTER TABLE "CalculatorResult" ADD CONSTRAINT "CalculatorResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey Task -> Project
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
