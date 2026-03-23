/* eslint-env node */
/**
 * Cross-platform Vercel rollback (same as scripts/rollback.sh).
 * Usage:
 *   VERCEL_TOKEN=... node scripts/rollback.js [-- additional vercel args]
 */
const { spawnSync } = require("node:child_process");

const token = process.env.VERCEL_TOKEN?.trim();
if (!token) {
  console.error("error: VERCEL_TOKEN is required");
  process.exit(1);
}

const extra = process.argv.slice(2);
const r = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["--yes", "vercel", "rollback", "--yes", `--token=${token}`, ...extra],
  { stdio: "inherit", shell: process.platform === "win32" }
);

process.exit(r.status ?? 1);

