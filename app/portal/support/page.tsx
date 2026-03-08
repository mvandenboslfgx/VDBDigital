import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SupportRequestForm from "./SupportRequestForm";

export default async function PortalSupportPage() {
  const user = await requireUser();
  if (!user) redirect("/login");
  const client = await prisma.client.findFirst({ where: { userId: user.id } });
  if (!client) redirect("/portal");

  return (
    <div className="glass-panel border-white/10 bg-black/80 p-6">
      <h1 className="section-heading">Support Request</h1>
      <h2 className="section-title">Submit a request</h2>
      <p className="mt-3 text-sm text-gray-400">Describe your issue and we’ll get back to you.</p>
      <SupportRequestForm />
    </div>
  );
}
