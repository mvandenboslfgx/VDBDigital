import Link from "next/link";
import { verifyUnsubscribeToken } from "@/lib/newsletter";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unsubscribe | VDB Digital",
  description: "Unsubscribe from VDB Digital newsletter.",
};

export default async function NewsletterUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let message = "";
  let success = false;

  if (token) {
    const payload = await verifyUnsubscribeToken(token);
    if (payload) {
      await prisma.newsletterSubscriber.deleteMany({
        where: { email: payload.email },
      });
      await prisma.user
        .updateMany({
          where: { email: payload.email },
          data: { newsletterOptIn: false },
        })
        .catch(() => {});
      message = "You have been unsubscribed from our newsletter.";
      success = true;
    } else {
      message = "Invalid or expired link. If you still want to unsubscribe, contact us.";
    }
  } else {
    message = "Missing unsubscribe token. Use the link from your email.";
  }

  return (
    <div className="min-h-screen bg-background pt-32 flex items-center justify-center">
      <div className="section-container">
        <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-black/80 p-8 text-center">
          <h1 className="text-xl font-semibold text-white">
            {success ? "Unsubscribed" : "Unsubscribe"}
          </h1>
          <p className="mt-4 text-sm text-gray-400">{message}</p>
          <Link href="/" className="btn-primary mt-6 inline-block">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
