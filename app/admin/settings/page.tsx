import { redirect } from "next/navigation";
import { requireAdminOrOwner } from "@/lib/auth";

export default async function AdminSettingsPage() {
  const user = await requireAdminOrOwner();
  if (!user) redirect("/dashboard");

  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl">
      <h1 className="section-heading">Settings</h1>
      <h2 className="section-title">Platform settings</h2>
      <p className="mt-3 text-sm text-gray-400">
        Configure via environment variables: SMTP, Supabase, TRUSTPILOT_URL, SITE_URL, etc.
      </p>
    </div>
  );
}
