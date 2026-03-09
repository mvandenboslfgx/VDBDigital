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
execSync("npx prisma generate", {
  stdio: "inherit",
  cwd: root,
  env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder", DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder" },
});
