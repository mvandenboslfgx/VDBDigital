import { createClient } from "@/lib/supabase/server";
import { prisma } from "./prisma";
import { logger } from "./logger";
import { recordUsageEvent } from "./usage-events";

export type UserRoleName = "lead" | "customer" | "pro" | "admin" | "owner";

const VALID_ROLES: UserRoleName[] = ["lead", "customer", "pro", "admin", "owner"];

export type CurrentUser = {
  id: string;
  email: string;
  role: UserRoleName;
  newsletterOptIn?: boolean;
};

function isValidRole(value: string): value is UserRoleName {
  return VALID_ROLES.includes(value as UserRoleName);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Default owner emails when OWNER_EMAILS env is not set (must match lib/permissions.ts OWNER_EMAILS). */
const DEFAULT_OWNER_EMAILS = [
  "info@vdbdigital.nl",
  "matthijsvandenbos8@gmail.com",
];

/**
 * Read OWNER_EMAILS: env (comma-separated) overrides hardcoded list.
 * Alleen server-side; waarde staat uitsluitend in .env (nooit in code of client).
 */
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

/**
 * Determine role for a newly created user:
 * - If email is in OWNER_EMAILS → owner
 * - Else if no users exist → admin (first user)
 * - Else → lead
 */
async function getRoleForNewUser(email: string): Promise<UserRoleName> {
  const ownerEmails = getOwnerEmails();
  const normalized = normalizeEmail(email);

  if (ownerEmails.length > 0 && ownerEmails.includes(normalized)) {
    logger.info("[Auth] Owner privileges granted");
    return "owner";
  }

  const count = await prisma.user.count();
  if (count === 0) {
    logger.info("[Auth] First user created as admin");
    return "admin";
  }

  return "lead";
}

/**
 * Resolve current user from session. Session is validated server-side via Supabase
 * (getUser() verifies the JWT from cookies); no client-supplied identity is trusted.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();
    if (!supabaseUser?.email) return null;

    const normalizedEmail = normalizeEmail(supabaseUser.email);
    const ownerEmails = getOwnerEmails();

    let user = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
    });

    if (!user) {
      const role = await getRoleForNewUser(supabaseUser.email);
      const regPref = await prisma.registrationNewsletter.findUnique({
        where: { email: supabaseUser.email },
      });
      const newsletterOptIn = regPref?.newsletterOptIn ?? false;
      user = await prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          role,
          newsletterOptIn,
        },
      });
      try {
        if (regPref) {
          if (newsletterOptIn) {
            await prisma.newsletterSubscriber.upsert({
              where: { email: user.email },
              create: { email: user.email, source: "registration" },
              update: {},
            });
          }
          await prisma.registrationNewsletter.deleteMany({
            where: { email: user.email },
          });
        }
      } catch (err) {
        logger.warn("[Auth] Newsletter/registration cleanup failed after user create", {
          error: String(err),
          email: user.email,
        });
      }
      try {
        await recordUsageEvent("signup", user.id);
      } catch (_) {}
      const { runInBackground } = await import("@/lib/runInBackground");
      const { auditUserSignup } = await import("@/lib/auditLog");
      const newUserId = user.id;
      const newUserEmail = user.email;
      runInBackground("auditUserSignup", () => auditUserSignup(newUserId, newUserEmail));
    } else {
      // Owner auto-upgrade on login: if email is in OWNER_EMAILS, set role to owner
      if (ownerEmails.length > 0 && ownerEmails.includes(normalizedEmail) && user.role !== "owner") {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "owner" },
        });
        logger.info("[Auth] Owner privileges granted");
        user = await prisma.user.findUnique({
          where: { id: user.id },
        }) ?? user;
      }
    }

    const role = user.role as string;
    if (!isValidRole(role)) {
      logger.warn("[Auth] Invalid role in database, defaulting to lead", { userId: user.id, role });
    }

    try {
      await prisma.client.updateMany({
        where: { email: user.email, userId: null },
        data: { userId: user.id },
      });
    } catch (err) {
      logger.warn("[Auth] Client link by email failed", { error: String(err), userId: user.id });
    }

    return {
      id: user.id,
      email: user.email,
      role: isValidRole(role) ? (role as UserRoleName) : "lead",
      newsletterOptIn: user.newsletterOptIn,
    };
  } catch {
    return null;
  }
}

export async function requireUser(role?: UserRoleName): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  if (role) {
    if (role === "admin") {
      // Admin pages must be accessible by both admin and owner (owner has full access).
      if (user.role !== "admin" && user.role !== "owner") return null;
    } else if (user.role !== role) {
      return null;
    }
  }
  return user;
}

/**
 * Require current user to be owner. Use in owner-only pages and API routes.
 * Returns the current user if role === "owner", otherwise null.
 */
export async function requireOwner(): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "owner") return null;
  return user;
}

/**
 * Require current user to be admin or owner. Use for admin-area pages that
 * should allow both roles (defense-in-depth alongside middleware).
 */
export async function requireAdminOrOwner(): Promise<CurrentUser | null> {
  return requireUser("admin");
}

/**
 * CSRF-validatie: delegeert naar lib/csrf (Origin + Referer).
 * Gebruik voor state-changing admin- en API-requests.
 */
export async function validateCsrf(request: Request): Promise<boolean> {
  const { validateCsrf: validate } = await import("@/lib/csrf");
  return validate(request);
}
