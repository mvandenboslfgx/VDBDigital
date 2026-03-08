import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAdmin, isOwner } from "@/lib/permissions";
import { OwnerSidebar } from "@/components/admin/OwnerSidebar";
import { logger } from "@/lib/logger";
import { getTranslations } from "@/lib/i18n";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | VDB Digital",
  description: "VDB Digital admin dashboard.",
};

const navKeys: { key: string; href: string }[] = [
  { key: "admin.dashboard", href: "/admin/dashboard" },
  { key: "admin.chat", href: "/admin/chat" },
  { key: "admin.metrics", href: "/admin/metrics" },
  { key: "admin.system", href: "/admin/system" },
  { key: "admin.users", href: "/admin/users" },
  { key: "admin.leads", href: "/admin/leads" },
  { key: "admin.projects", href: "/admin/projects" },
  { key: "admin.analytics", href: "/admin/analytics" },
  { key: "admin.aiUsage", href: "/admin/ai-usage" },
  { key: "admin.clients", href: "/admin/clients" },
  { key: "admin.websites", href: "/admin/websites" },
  { key: "admin.invoices", href: "/admin/invoices" },
  { key: "admin.reviews", href: "/admin/reviews" },
  { key: "admin.newsletter", href: "/admin/newsletter" },
  { key: "admin.maintenance", href: "/admin/maintenance" },
  { key: "admin.settings", href: "/admin/settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = getTranslations("nl");
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  if (!canAccessAdmin(currentUser)) {
    logger.warn("[Security] Non-admin attempted admin route", { userId: currentUser.id });
    redirect("/dashboard");
  }

  const showOwnerSidebar = isOwner(currentUser);

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="section-container grid gap-6 lg:grid-cols-[240px,1fr]">
        {showOwnerSidebar ? (
          <OwnerSidebar userEmail={currentUser.email} />
        ) : (
          <aside className="sticky top-20 h-fit rounded-2xl border border-white/10 bg-black/80 p-5 backdrop-blur-xl">
            <Link href="/admin/dashboard" className="inline-block">
              <Image
                src="/logo-vdb.png"
                alt="VDB Digital"
                width={220}
                height={72}
                className="h-16 w-auto object-contain brightness-105 contrast-105"
              />
            </Link>
            <p className="mt-1 text-xs text-gray-500">{t("admin.title")}</p>
            <p className="mt-2 truncate text-sm font-medium text-white">{currentUser.email}</p>
            <nav className="mt-6 space-y-0.5 text-sm">
              {navKeys.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-gray-300 transition hover:bg-white/5 hover:text-gold"
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>
            <Link
              href="/"
              className="mt-6 block text-xs text-gray-500 hover:text-gold"
            >
              ← {t("common.backToSite")}
            </Link>
          </aside>
        )}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
