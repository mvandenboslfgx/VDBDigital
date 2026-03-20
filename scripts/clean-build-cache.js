#!/usr/bin/env node
/**
 * Remove build output and tool caches that can corrupt Next.js generated types
 * (e.g. .next/dev/types) or confuse incremental builds. Safe no-op if paths missing.
 *
 * Usage: node scripts/clean-build-cache.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const targets = [
  path.join(root, ".next"),
  path.join(root, "node_modules", ".cache"),
];

for (const dir of targets) {
  if (!fs.existsSync(dir)) continue;
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`[clean-build-cache] removed ${path.relative(root, dir) || dir}`);
  } catch (e) {
    const code = e && typeof e === "object" ? e.code : undefined;
    if (code === "EPERM" || code === "EBUSY") {
      console.error(
        `[clean-build-cache] Cannot remove (files in use): ${path.relative(root, dir) || dir}`
      );
      console.error("[clean-build-cache] Stop `next dev` / close the IDE lock on .next, then retry.");
      process.exit(1);
    }
    throw e;
  }
}

console.log("[clean-build-cache] done");
