import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminNewsletterPage() {
  const user = await requireUser("admin");
  if (!user) redirect("/login");

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl">
      <h1 className="section-heading">Newsletter</h1>
        <h2 className="section-title">Subscribers</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
                <th className="pb-3 pr-4 font-medium">Email</th>
                <th className="pb-3 pr-4 font-medium">Source</th>
                <th className="pb-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {subscribers.map((s) => (
                <tr key={s.id} className="border-b border-white/5">
                  <td className="py-3 pr-4 font-medium text-white">{s.email}</td>
                  <td className="py-3 pr-4">{s.source ?? "website"}</td>
                  <td className="py-3 text-gray-500">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      {subscribers.length === 0 && (
        <p className="py-8 text-center text-gray-500">No subscribers yet.</p>
      )}
    </div>
  );
}
