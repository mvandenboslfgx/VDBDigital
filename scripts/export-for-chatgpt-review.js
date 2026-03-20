#!/usr/bin/env node
/**
 * Export key project files into one text file for ChatGPT / triple check.
 * Run: node scripts/export-for-chatgpt-review.js
 * Output: PROJECT_EXPORT_FOR_REVIEW.txt in project root (add to .gitignore).
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "PROJECT_EXPORT_FOR_REVIEW.txt");

const DIRS = ["app", "components", "lib", "modules", "prisma"];
const INCLUDE = [".ts", ".tsx", ".js", ".mjs", ".prisma"];
const SKIP = ["node_modules", ".next", ".git", "PROJECT_EXPORT_FOR_REVIEW.txt"];

function shouldSkip(dir) {
  return SKIP.some((s) => dir === s || dir.startsWith("."));
}

function collectFiles(dir, base = ROOT) {
  const full = path.join(base, dir);
  if (!fs.existsSync(full) || !fs.statSync(full).isDirectory()) return [];
  const entries = fs.readdirSync(full, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!shouldSkip(e.name)) files.push(...collectFiles(rel, base));
    } else if (INCLUDE.some((ext) => e.name.endsWith(ext))) {
      files.push(path.join(base, rel));
    }
  }
  return files.sort();
}

const allFiles = [];
for (const d of DIRS) {
  allFiles.push(...collectFiles(d));
}

// Add root config files
["next.config.mjs", "tailwind.config.ts", "tsconfig.json", "package.json"].forEach((f) => {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) allFiles.push(p);
});
const rootExtras = [
  "proxy.ts",
  "eslint.config.mjs",
  "prisma.config.ts",
];
for (const f of rootExtras) {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) allFiles.push(p);
}

let out = "";
out += "=== VDB Digital – Full project export for ChatGPT triple check ===\n";
out += "Generated: " + new Date().toISOString() + "\n\n";

for (const file of allFiles) {
  const rel = path.relative(ROOT, file);
  out += "\n\n";
  out += "--- FILE: " + rel + " ---\n\n";
  try {
    out += fs.readFileSync(file, "utf8");
  } catch (e) {
    out += "(read error: " + e.message + ")";
  }
}

fs.writeFileSync(OUT, out, "utf8");
console.log("Written:", OUT);
console.log("Files:", allFiles.length);
console.log("Size (KB):", (out.length / 1024).toFixed(1));
