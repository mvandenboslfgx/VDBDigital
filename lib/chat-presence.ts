const ADMIN_ONLINE_TTL_MS = 5 * 60 * 1000; // 5 min
let lastAdminPresenceAt = 0;

export function setAdminPresence(): void {
  lastAdminPresenceAt = Date.now();
}

export function isAdminOnline(): boolean {
  return Date.now() - lastAdminPresenceAt < ADMIN_ONLINE_TTL_MS;
}
