import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ReviewTokenPage({
  params,
}: {
  params: { token: string };
}) {
  const tokenRecord = await prisma.reviewToken.findUnique({
    where: { token: params.token },
    include: { project: true },
  });

  if (!tokenRecord || !tokenRecord.project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="section-container max-w-lg">
        <div className="glass-panel border-white/10 bg-black/80 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.95)]">
          <h1 className="section-heading">Project review</h1>
          <h2 className="section-title">
            How did we do for {tokenRecord.project.name}?
          </h2>
          <p className="mt-3 text-sm text-gray-300">
            Share your honest experience. Your feedback shapes the next
            evolution of our studio.
          </p>
          <form
            action={`/api/review`}
            method="post"
            className="mt-6 space-y-4"
          >
            <input type="hidden" name="token" value={params.token} />
            <div>
              <label className="block text-xs font-medium text-gray-300">
                Name
              </label>
              <input
                name="name"
                className="input-base mt-1"
                required
                defaultValue={tokenRecord.project.clientId}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300">
                Rating
              </label>
              <select
                name="rating"
                className="input-base mt-1"
                defaultValue="5"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} stars
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300">
                Review
              </label>
              <textarea
                name="content"
                className="input-base mt-1 min-h-[120px]"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Submit review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

