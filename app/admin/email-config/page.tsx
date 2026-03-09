import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { EmailConfigTable } from "./EmailConfigTable";
import { EmailConfigForm } from "./EmailConfigForm";

export default async function AdminEmailConfigPage() {
  const user = await getCurrentUser();
  if (!user || !canAccessAdmin(user)) redirect("/dashboard");

  const list = await prisma.siteEmailConfig.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, sourceEmail: true, targetEmail: true, createdAt: true },
  });

  const rows = list.map((r) => ({
    id: r.id,
    sourceEmail: r.sourceEmail,
    targetEmail: r.targetEmail,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-white/10 bg-black/80 p-6 shadow-sm backdrop-blur-xl">
        <h1 className="text-xl font-semibold text-white">E-mailconfiguratie</h1>
        <p className="mt-1 text-sm text-gray-400">
          Bron-e-mailadressen (bv. security@vdbdigital.nl) doorsturen naar een doeladres (verzamelmail).
        </p>

        <div className="mt-6">
          <EmailConfigTable list={rows} />
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <h2 className="text-sm font-semibold text-white">Nieuwe configuratie toevoegen</h2>
          <EmailConfigForm />
        </div>
      </div>
    </div>
  );
}
