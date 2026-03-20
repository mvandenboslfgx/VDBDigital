import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (isAdmin(user)) redirect("/admin/dashboard");

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="section-container grid gap-8 lg:grid-cols-[220px,1fr]">
        <aside className="glass-panel h-full border-white/10 bg-black/80 p-5">
          <Link href="/portal" className="inline-block">
            <Image
              src="/logo-vdb.png"
              alt="VDB Digital"
              width={220}
              height={72}
              className="h-16 w-auto object-contain brightness-105 contrast-105"
            />
          </Link>
          <p className="mt-1 text-xs text-gray-500">Portal</p>
          <p className="mt-2 text-sm font-semibold text-white">{user.email}</p>
          <nav className="mt-6 space-y-1 text-sm text-gray-300">
            <Link href="/portal" className="block rounded-lg px-3 py-2 hover:bg-white/5 hover:text-gold">Dashboard</Link>
            <Link href="/portal/projects" className="block rounded-lg px-3 py-2 hover:bg-white/5 hover:text-gold">My Projects</Link>
            <Link href="/portal/invoices" className="block rounded-lg px-3 py-2 hover:bg-white/5 hover:text-gold">My Invoices</Link>
            <Link href="/portal/files" className="block rounded-lg px-3 py-2 hover:bg-white/5 hover:text-gold">My Files</Link>
            <Link href="/portal/support" className="block rounded-lg px-3 py-2 hover:bg-white/5 hover:text-gold">Support Request</Link>
            <Link href="/portal/review" className="block rounded-lg px-3 py-2 hover:bg-white/5 hover:text-gold">Leave Review</Link>
            <Link href="/portal/settings" className="block rounded-lg px-3 py-2 hover:bg-white/5 hover:text-gold">Settings</Link>
          </nav>
          <form action="/api/auth/logout" method="POST" className="mt-6">
            <button type="submit" className="text-xs text-gray-500 hover:text-gold">Sign out</button>
          </form>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
