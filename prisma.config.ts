import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { PrismaConfig } from "prisma";

/**
 * Prisma 6 + `prisma.config.ts`: CLI slaat standaard `.env`-loading over.
 * Geen npm-pakket `dotenv`: alleen een minimale loader als `.env` op schijf staat
 * (lokaal). Op Vercel/CI is er geen `.env` → no-op; env komt uit het platform.
 */
function loadDotenvFileIfPresent(filename = ".env") {
  const abs = resolve(process.cwd(), filename);
  if (!existsSync(abs)) return;
  const content = readFileSync(abs, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadDotenvFileIfPresent();

if (!process.env.DIRECT_URL?.trim() && process.env.DATABASE_URL?.trim()) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
} satisfies PrismaConfig;
