"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const OWNER_NAV = [
  { label: "Control Center", href: "/admin/control-center" },
  { label: "Accounts", href: "/admin/users" },
  { label: "Betalingen", href: "/admin/betalingen" },
  { label: "Leads", href: "/admin/leads" },
  { label: "Content Generator", href: "/admin/content-generator" },
  { label: "Products", href: "/admin/products" },
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
    <aside className="sticky top-20 h-fit rounded-2xl border border-amber-500/20 bg-black/90 p-5 backdrop-blur-xl">
      <Link href="/admin/control-center" className="inline-block">
        <Image
          src="/logo-vdb.png"
          alt="VDB Digital"
          width={220}
          height={72}
          className="h-16 w-auto object-contain brightness-105 contrast-105"
        />
      </Link>
      <p className="mt-1 text-xs font-medium text-amber-400/90">Owner Control Center</p>
      <p className="mt-2 truncate text-sm text-white/80">{userEmail}</p>
      <nav className="mt-6 space-y-0.5 text-sm">
        {OWNER_NAV.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 transition ${
                isActive
                  ? "bg-amber-500/15 text-amber-400"
                  : "text-gray-300 hover:bg-white/5 hover:text-amber-400/90"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/"
        className="mt-6 block text-xs text-gray-500 hover:text-amber-400/90"
      >
        ← Back to site
      </Link>
    </aside>
  );
}
