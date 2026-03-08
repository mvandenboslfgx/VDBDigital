/**
 * System notifications for the dashboard: usage limits, upgrade suggestions, announcements.
 * Notifications are derived from user state; no separate table required for basic types.
 */

import { prisma } from "@/lib/prisma";
import { checkUsageLimit } from "@/lib/usage";
import { getPlanConfigByPlanName } from "@/lib/plans";

export type NotificationType =
  | "usage_limit_warning"
  | "upgrade_suggestion"
  | "ai_announcement"
  | "chat_message";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  createdAt: string;
}

/** Usage limit warning when approaching or over limit. */
async function getUsageLimitNotifications(userId: string): Promise<AppNotification[]> {
  const check = await checkUsageLimit(userId);
  const out: AppNotification[] = [];
  const now = new Date().toISOString();

  if (check.exceeded) {
    const limitName =
      check.exceeded === "ai"
        ? "AI-gebruik"
        : check.exceeded === "calculator"
          ? "Rekenmachines"
          : "Projecten";
    out.push({
      id: `limit-${check.exceeded}-${now}`,
      type: "usage_limit_warning",
      title: "Limiet bereikt",
      message: `U heeft uw maandlimiet voor ${limitName} bereikt. Upgrade voor meer.`,
      actionUrl: "/pricing",
      createdAt: now,
    });
  } else {
    const { usage, limits } = check;
    if (
      limits.aiLimit !== Infinity &&
      usage.aiUsage >= Math.max(0, limits.aiLimit - 5)
    ) {
      out.push({
        id: `limit-ai-warn-${now}`,
        type: "usage_limit_warning",
        title: "AI-gebruik",
        message: `${usage.aiUsage} / ${limits.aiLimit} AI-aanroepen deze maand. Overweeg een upgrade.`,
        actionUrl: "/dashboard/billing",
        createdAt: now,
      });
    }
  }
  return out;
}

/** Upgrade suggestion for free/starter users. */
async function getUpgradeNotifications(userId: string): Promise<AppNotification[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: { select: { name: true } } },
  });
  const planName = user?.plan?.name ?? null;
  const config = getPlanConfigByPlanName(planName);
  const now = new Date().toISOString();

  if (config.monthlyPrice === 0) {
    return [
      {
        id: `upgrade-${now}`,
        type: "upgrade_suggestion",
        title: "Meer mogelijkheden",
        message: "Upgrade naar Pro voor AI-tools, meer audits en rekenmachines.",
        actionUrl: "/pricing",
        createdAt: now,
      },
    ];
  }
  return [];
}

/** Static or future AI tool announcements. */
function getAnnouncementNotifications(): AppNotification[] {
  const now = new Date().toISOString();
  return [
    {
      id: `announce-ai-tools-${now}`,
      type: "ai_announcement",
      title: "Nieuwe AI-tools",
      message: "Probeer Marketingstrategie, Landingpagina-generator en SEO-audit in AI-tools.",
      actionUrl: "/dashboard/ai-tools",
      createdAt: now,
    },
  ];
}

/** Chat unread count for admin/owner. */
async function getChatNotifications(userId: string): Promise<AppNotification[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== "admin" && user?.role !== "owner") return [];

  const count = await prisma.chatMessage.count({
    where: { fromAdmin: false, readAt: null },
  });
  if (count === 0) return [];

  const now = new Date().toISOString();
  return [
    {
      id: `chat-unread-${now}`,
      type: "chat_message",
      title: "Nieuw chatbericht",
      message: count === 1 ? "1 ongelezen chatbericht." : `${count} ongelezen chatberichten.`,
      actionUrl: "/admin/chat",
      createdAt: now,
    },
  ];
}

/**
 * Get all notifications for a user (usage warnings, upgrade, announcements, chat for admin).
 */
export async function getNotificationsForUser(
  userId: string
): Promise<AppNotification[]> {
  const [limit, upgrade, announcements, chat] = await Promise.all([
    getUsageLimitNotifications(userId),
    getUpgradeNotifications(userId),
    Promise.resolve(getAnnouncementNotifications()),
    getChatNotifications(userId),
  ]);
  const combined = [...limit, ...upgrade, ...announcements, ...chat];
  combined.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return combined.slice(0, 10);
}
