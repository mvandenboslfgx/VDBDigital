/**
 * Central permission system for VDB Digital.
 * Route access rules and helpers; role comes from database user record (lib/auth).
 */

import type { UserRoleName } from "./auth";
import { DEFAULT_OWNER_EMAILS } from "./ownerEmails";

/** Only these emails are automatically granted owner role (plus env OWNER_EMAILS). */
export const OWNER_EMAILS = DEFAULT_OWNER_EMAILS;

/** Roles supported by the app (must match Prisma UserRole). */
export const ROLES = ["lead", "customer", "pro", "admin", "owner"] as const;
export type Role = (typeof ROLES)[number];

/** Minimal user shape for permission checks (role from DB). */
export type UserWithRole = { role: UserRoleName };

/** Routes that require admin role. Admin may access; owner has full access. */
export const ADMIN_ROUTES = ["/admin"] as const;

/** Routes that require owner role. Only owner may access. */
export const OWNER_ROUTES = [
  "/admin/control-center",
  "/admin/users",
  "/admin/leads",
  "/admin/finance",
  "/admin/betalingen",
  "/admin/ai-usage",
  "/admin/plans",
  "/admin/analytics",
  "/admin/system",
  "/admin/logs",
] as const;

/** Routes that require dashboard access (any authenticated user). */
export const DASHBOARD_ROUTES = ["/dashboard"] as const;

/** Routes that require portal access (customer only). */
export const PORTAL_ROUTES = ["/portal"] as const;

/**
 * Whether the user is an owner.
 * Only role === "owner" is owner.
 */
export function isOwner(user: UserWithRole | null): user is UserWithRole & { role: "owner" } {
  return user != null && user.role === "owner";
}

/**
 * Admin or owner (full staff access). Prefer this over raw role checks.
 */
export function isAdmin(user: UserWithRole | null): boolean {
  return user != null && (user.role === "admin" || user.role === "owner");
}

/**
 * Whether the user can access the admin area.
 * Only role === "admin" or "owner" may access /admin.
 */
export function canAccessAdmin(
  user: UserWithRole | null
): user is UserWithRole & { role: "admin" | "owner" } {
  return isAdmin(user);
}

/**
 * Whether the user can access owner-only routes (control center, etc.).
 * Only role === "owner" may access.
 */
export function canAccessOwnerRoutes(user: UserWithRole | null): user is UserWithRole & { role: "owner" } {
  return isOwner(user);
}

/**
 * Whether the user can access the dashboard.
 * All authenticated roles may access /dashboard.
 */
export function canAccessDashboard(user: UserWithRole | null): user is UserWithRole {
  if (!user) return false;
  return ROLES.includes(user.role as Role);
}

/**
 * Whether the user can access the client portal.
 * Only customer may access /portal (and linked user via client).
 */
export function canAccessPortal(user: UserWithRole | null): user is UserWithRole {
  if (!user) return false;
  return user.role === "customer";
}

/**
 * Check if a path is under admin route prefix.
 */
export function isAdminPath(path: string): boolean {
  return ADMIN_ROUTES.some((prefix) => path.startsWith(prefix));
}

/**
 * Check if a path is an owner-only route.
 */
export function isOwnerPath(path: string): boolean {
  return OWNER_ROUTES.some((route) => path === route || path.startsWith(route + "/"));
}

export function isDashboardPath(path: string): boolean {
  return DASHBOARD_ROUTES.some((prefix) => path.startsWith(prefix));
}

export function isPortalPath(path: string): boolean {
  return PORTAL_ROUTES.some((prefix) => path.startsWith(prefix));
}
