import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Free AI Website Audit",
  description:
    "Get a free AI-powered website audit. We analyze SEO, performance, UX and conversion potential and send you a detailed report.",
  path: "/ai-website-audit",
});

export default function AIWebsiteAuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
