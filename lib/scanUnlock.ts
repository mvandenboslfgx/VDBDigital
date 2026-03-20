const COOKIE_NAME = "scan_unlocked";
const COOKIE_DAYS = 7;

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function setScanUnlockCookie(email: string): void {
  const hashed = simpleHash(email.toLowerCase().trim());
  const expires = new Date(Date.now() + COOKIE_DAYS * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE_NAME}=${hashed}; path=/; expires=${expires}; SameSite=Lax`;
}

export function isScanUnlocked(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE_NAME}=`));
}
