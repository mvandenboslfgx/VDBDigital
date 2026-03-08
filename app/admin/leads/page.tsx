import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConvertLeadButton } from "@/components/admin/ConvertLeadButton";
import { LeadActions } from "@/components/admin/LeadActions";

export default async function AdminLeadsPage() {
  const user = await requireOwner();
  if (!user) redirect("/dashboard");

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      auditReports: { orderBy: { createdAt: "desc" }, take: 1 },
      auditResult: true,
    },
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl">
      <h1 className="text-xl font-semibold text-white">Leads</h1>
      <p className="mt-1 text-sm text-gray-400">
        Contact and audit leads. Convert to user, send email, or delete.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
              <th className="pb-3 pr-4 font-medium">Name</th>
              <th className="pb-3 pr-4 font-medium">Email</th>
              <th className="pb-3 pr-4 font-medium">Website</th>
              <th className="pb-3 pr-4 font-medium">AuditScore</th>
              <th className="pb-3 pr-4 font-medium">Created</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {leads.map((lead) => {
              const score = lead.leadScore ?? lead.auditResult?.score ?? null;
              return (
                <tr key={lead.id} className="border-b border-white/5">
                  <td className="py-3 pr-4 font-medium text-white">{lead.name}</td>
                  <td className="py-3 pr-4">{lead.email}</td>
                  <td className="py-3 pr-4">
                    {lead.website ? (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:underline"
                      >
                        {lead.website.replace(/^https?:\/\//, "").slice(0, 30)}
                        {lead.website.length > 30 ? "…" : ""}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-3 pr-4">{score != null ? score : "—"}</td>
                  <td className="py-3 pr-4">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {!lead.convertedAt ? (
                        <ConvertLeadButton
                          leadId={lead.id}
                          leadName={lead.name}
                          leadEmail={lead.email}
                          leadCompany={lead.company}
                        />
                      ) : (
                        <span className="text-xs text-emerald-500">Converted</span>
                      )}
                      <LeadActions leadId={lead.id} leadEmail={lead.email} leadName={lead.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {leads.length === 0 && (
        <p className="py-8 text-center text-gray-500">No leads yet.</p>
      )}
    </div>
  );
}
