-- AlterTable
ALTER TABLE "User" ADD COLUMN "newsletterOptIn" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "RegistrationNewsletter" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "newsletterOptIn" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistrationNewsletter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationNewsletter_email_key" ON "RegistrationNewsletter"("email");
CREATE INDEX "RegistrationNewsletter_email_idx" ON "RegistrationNewsletter"("email");
