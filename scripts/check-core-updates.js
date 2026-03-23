#!/usr/bin/env node
/**
 * Vergelijkt core dependency-versies in package.json tussen PR-base en HEAD.
 *
 * Modi:
 * - Standaard (lokaal): exit 1 bij wijziging
 * - `--ci-report-only`: schrijft altijd `core_changed` naar GITHUB_OUTPUT, exit 0
 *   (workflow doet label + aparte enforce-stap)
 */
const { execSync } = require("node:child_process");
const fs = require("node:fs");

const CORE = ["next", "react", "react-dom", "prisma", "@prisma/client"];
const ciReportOnly =
  process.argv.includes("--ci-report-only") || process.env.CI_REPORT_ONLY === "1";

const baseSha = process.env.BASE_SHA;
const headSha = process.env.HEAD_SHA;

if (!baseSha || !headSha) {
  console.log("[check-core-updates] BASE_SHA/HEAD_SHA niet gezet — overslaan (geen PR-context).");
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, "core_changed=false\n");
  }
  process.exit(0);
}

function readPkgAt(ref) {
  try {
    const raw = execSync(`git show ${ref}:package.json`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return JSON.parse(raw);
  } catch (e) {
    console.error("[check-core-updates] Kan package.json niet lezen voor ref:", ref);
    return null;
  }
}

function collectCoreVersions(pkg) {
  const out = /** @type {Record<string, string>} */ ({});
  for (const section of ["dependencies", "devDependencies"]) {
    const block = pkg[section];
    if (!block || typeof block !== "object") continue;
    for (const dep of CORE) {
      if (block[dep] != null) out[dep] = String(block[dep]).trim();
    }
  }
  return out;
}

const basePkg = readPkgAt(baseSha);
const headPkg = readPkgAt(headSha);
if (!basePkg || !headPkg) {
  process.exit(1);
}

const baseV = collectCoreVersions(basePkg);
const headV = collectCoreVersions(headPkg);

/** @type {{ dep: string; from?: string; to?: string }[]} */
const changed = [];
for (const dep of CORE) {
  const b = baseV[dep];
  const h = headV[dep];
  if (b !== h) {
    changed.push({ dep, from: b, to: h });
  }
}

if (changed.length === 0) {
  console.log("[check-core-updates] Geen core dependency versie-wijziging in package.json.");
} else {
  console.log("\n🔴 Core dependency change detected:\n");
  changed.forEach((c) => {
    console.log(`  - ${c.dep}: ${c.from ?? "(missing on base)"} → ${c.to ?? "(missing on head)"}`);
  });
  console.log("");
}

const ghOut = process.env.GITHUB_OUTPUT;
if (ghOut) {
  fs.appendFileSync(ghOut, `core_changed=${changed.length > 0}\n`);
}

if (ciReportOnly) {
  process.exit(0);
}

if (changed.length > 0) {
  console.log("Handmatige review vereist voordat dit als ‘veilig’ gemerged wordt.");
  process.exit(1);
}
process.exit(0);
