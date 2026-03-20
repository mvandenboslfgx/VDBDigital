import "dotenv/config";
import type { PrismaConfig } from "prisma";

// Prisma requires env vars referenced from the schema to exist at config-load time.
// Fallback: if DIRECT_URL isn't set, use DATABASE_URL so local installs/tools don't crash.
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
} satisfies PrismaConfig;
