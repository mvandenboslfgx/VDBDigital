/**
 * Single source for owner email defaults and OWNER_EMAILS env parsing (server-only).
 */
export const DEFAULT_OWNER_EMAILS = [
  "info@vdbdigital.nl",
  "matthijsvandenbos8@gmail.com",
] as const;

export function getOwnerEmails(): string[] {
  const raw = process.env.OWNER_EMAILS;
  if (raw && typeof raw === "string") {
    const fromEnv = raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (fromEnv.length > 0) return fromEnv;
  }
  return [...DEFAULT_OWNER_EMAILS];
}
