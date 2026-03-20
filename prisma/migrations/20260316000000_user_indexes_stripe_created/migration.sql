-- Add indexes on User for webhook and control-center queries
CREATE INDEX IF NOT EXISTS "User_stripeSubscriptionId_idx" ON "User"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");
