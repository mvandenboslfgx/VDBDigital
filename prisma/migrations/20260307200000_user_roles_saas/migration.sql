-- CreateEnum (UserRole: lead, pro, customer, admin; map client -> customer)
CREATE TYPE "UserRole_new" AS ENUM ('lead', 'pro', 'customer', 'admin');

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING (
  CASE "role"::text
    WHEN 'client' THEN 'customer'::"UserRole_new"
    WHEN 'admin' THEN 'admin'::"UserRole_new"
    ELSE 'lead'::"UserRole_new"
  END
);
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'lead';

DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";

CREATE INDEX "User_role_idx" ON "User"("role");
