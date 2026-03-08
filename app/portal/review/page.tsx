import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PortalReviewPage() {
  const user = await requireUser();
  if (!user) redirect("/login");
  const client = await prisma.client.findFirst({ where: { userId: user.id } });
  if (!client) redirect("/portal");

  const projects = await prisma.project.findMany({
    where: { clientId: client.id },
    include: { reviewTokens: { where: { usedAt: null }, take: 1 } },
  });
  const token = projects.flatMap((p) => p.reviewTokens)[0];

  const trustpilotUrl = process.env.NEXT_PUBLIC_TRUSTPILOT_URL ?? "https://www.trustpilot.com/review/vdb.digital";

  return (
    <div className="glass-panel border-white/10 bg-black/80 p-6">
      <h1 className="section-heading">Leave Review</h1>
      <h2 className="section-title">Share your experience</h2>
      <p className="mt-3 text-sm text-gray-400">Your feedback helps us improve.</p>
      <div className="mt-6 space-y-4">
        {token ? (
          <Link href={`/review/${token.token}`} className="btn-primary inline-block">
            Leave a review on our site
          </Link>
        ) : (
          <p className="text-gray-500">No active review link. Ask your project manager for one.</p>
        )}
        <p className="text-sm text-gray-400">
          Or review us on{" "}
          <a href={trustpilotUrl} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
            Trustpilot
          </a>
        </p>
      </div>
    </div>
  );
}
