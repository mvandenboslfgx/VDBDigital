import SiteShell from "@/components/SiteShell";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const TRUSTPILOT_URL = process.env.NEXT_PUBLIC_TRUSTPILOT_URL ?? "https://www.trustpilot.com/review/vdb.digital";

export const metadata: Metadata = {
  title: "Reviews | VDB Digital",
  description: "What our clients say about VDB Digital.",
};

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  return (
    <SiteShell>
      <div className="section-container py-16">
        <h1 className="section-heading">Reviews</h1>
        <h2 className="section-title mt-2">What our clients say</h2>
        <p className="mt-4 max-w-2xl text-gray-400">
          Real feedback from projects we’ve delivered. You can also find us on Trustpilot.
        </p>
        <a
          href={TRUSTPILOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-gold hover:underline"
        >
          View on Trustpilot →
        </a>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-white/10 bg-black/60 p-6">
              <p className="text-lg font-semibold text-gold">{r.rating} ★</p>
              <p className="mt-2 text-gray-300">{r.content}</p>
              <p className="mt-3 text-sm text-gray-500">— {r.name}</p>
            </div>
          ))}
        </div>
        {reviews.length === 0 && (
          <p className="mt-8 text-gray-500">No reviews yet. Check back soon.</p>
        )}
      </div>
    </SiteShell>
  );
}
