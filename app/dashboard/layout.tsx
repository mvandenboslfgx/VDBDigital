import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth";
import DashboardNav from "@/components/dashboard/DashboardNav";
import NotificationBell from "@/components/dashboard/NotificationBell";
import type { DashboardRole } from "@/components/dashboard/DashboardNav";
import { getTranslations } from "@/lib/i18n";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = getTranslations("nl");
  const user = await requireUser();
  if (!user) redirect("/login");
  if (user.role === "admin" || user.role === "owner") redirect("/admin");

  const dashboardRole: DashboardRole = user.role;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-surface/90 backdrop-blur-lg">
        <div className="section-container flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/logo-vdb.png"
              alt="VDB Digital"
              width={220}
              height={72}
              sizes="220px"
              priority
              className="h-16 w-auto object-contain"
            />
            <span className="text-sm font-medium text-slate-500">{t("dashboard.title")}</span>
          </Link>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Link
              href="/"
              className="text-sm text-slate-600 transition-colors hover:text-slate-900"
            >
              {t("dashboard.backToSite")}
            </Link>
            <span className="text-sm text-slate-600">{user.email}</span>
            <Link
              href="/logout"
              className="text-sm text-slate-600 transition-colors hover:text-indigo-600"
            >
              {t("dashboard.logout")}
            </Link>
          </div>
        </div>
      </header>
      <div className="section-container flex gap-12 py-8">
        <aside className="w-56 shrink-0">
          <DashboardNav role={dashboardRole} />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
