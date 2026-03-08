import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminReviewsPage() {
  const user = await requireUser("admin");
  if (!user) redirect("/login");

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { project: { include: { client: true } } },
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl">
      <h1 className="section-heading">Reviews</h1>
      <h2 className="section-title">Customer reviews</h2>
      <p className="mt-1 text-sm text-gray-400">
        Ratings linked to clients and projects.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
              <th className="pb-3 pr-4 font-medium">Rating</th>
              <th className="pb-3 pr-4 font-medium">Client</th>
              <th className="pb-3 font-medium">Project</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {reviews.map((r) => (
              <tr key={r.id} className="border-b border-white/5">
                <td className="py-3 pr-4">
                  <span className="font-medium text-gold">{r.rating}★</span>
                </td>
                <td className="py-3 pr-4 text-white">{r.name}</td>
                <td className="py-3">
                  {r.project ? (
                    <span>{r.project.name} ({r.project.client.name})</span>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.length === 0 && (
          <p className="py-8 text-center text-gray-500">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
