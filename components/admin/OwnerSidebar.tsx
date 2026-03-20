"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const OWNER_NAV = [
  { label: "Site Beheer", href: "/admin/site" },
  { label: "Control Center", href: "/admin/control-center" },
  { label: "Accounts", href: "/admin/users" },
  { label: "Betalingen", href: "/admin/betalingen" },
  { label: "Leads", href: "/admin/leads" },
  { label: "Content Generator", href: "/admin/content-generator" },
  { label: "Products", href: "/admin/products" },
  { label: "Ads", href: "/admin/ads" },
  { label: "E-mailconfiguratie", href: "/admin/email-config" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Finance", href: "/admin/finance" },
  { label: "AI Usage", href: "/admin/ai-usage" },
  { label: "Plans", href: "/admin/plans" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "System", href: "/admin/system" },
  { label: "Logs", href: "/admin/logs" },
  { label: "Settings", href: "/admin/settings" },
] as const;

interface OwnerSidebarProps {
  userEmail: string;
}

export function OwnerSidebar({ userEmail }: OwnerSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-20 h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <Link href="/admin/site" className="inline-block">
        <Image
          src="/logo-vdb.png"
          alt="VDB Digital"
          width={220}
          height={72}
          className="h-16 w-auto object-contain brightness-105 contrast-105"
        />
      </Link>
      <p className="mt-1 text-xs font-medium text-indigo-600">Owner Control Center</p>
      <p className="mt-2 truncate text-sm text-gray-600">{userEmail}</p>
      <nav className="mt-6 space-y-0.5 text-sm">
        {OWNER_NAV.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 transition ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/"
        className="mt-6 block text-xs text-gray-500 hover:text-indigo-700"
      >
        ← Back to site
      </Link>
    </aside>
  );
}
