import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import PortalNewsletterSetting from "@/components/portal/PortalNewsletterSetting";

export default async function PortalSettingsPage() {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (isAdmin(user)) redirect("/admin");

  const newsletterOptIn = user.newsletterOptIn ?? false;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl">
      <h1 className="section-heading">Settings</h1>
      <h2 className="section-title">Your preferences</h2>
      <p className="mt-2 text-sm text-gray-400">
        Manage your account and notification preferences.
      </p>
      <div className="mt-8 space-y-6">
        <PortalNewsletterSetting
          initialOptIn={newsletterOptIn}
          email={user.email}
        />
      </div>
    </div>
  );
}
