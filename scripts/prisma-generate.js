#!/usr/bin/env node
/**
 * Run prisma generate. Sets a dummy DATABASE_URL if not present so install works without .env.
 * Real DATABASE_URL is required for migrate/seed.
 */
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://placeholder:placeholder@localhost:5432/placeholder";
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}
const path = require("path");
const { execSync } = require("child_process");
const root = path.join(__dirname, "..");
const env = {
  ...process.env,
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  DIRECT_URL:
    process.env.DIRECT_URL ||
    process.env.DATABASE_URL ||
    "postgresql://placeholder:placeholder@localhost:5432/placeholder",
};

try {
  execSync("npx prisma generate", {
    stdio: "inherit",
    cwd: root,
    env,
  });
} catch (error) {
  // Windows file locks can block Prisma engine rename; fallback keeps install usable.
  if (process.platform === "win32") {
    console.warn(
      "[prisma-generate] prisma generate failed on Windows, retrying with --no-engine."
    );
    execSync("npx prisma generate --no-engine", {
      stdio: "inherit",
      cwd: root,
      env,
    });
  } else {
    throw error;
  }
}
