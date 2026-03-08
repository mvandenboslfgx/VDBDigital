import Link from "next/link";
import SiteShell from "@/components/SiteShell";

export const metadata = {
  title: "Blog | VDB Digital",
  description: "Artikelen over websitegroei, SEO en conversie.",
};

export default function BlogPage() {
  return (
    <SiteShell>
      <div className="section-container py-16 md:py-24">
        <h1 className="text-display-sm font-semibold text-white">Blog</h1>
        <p className="mt-4 text-body text-zinc-400">
          Binnenkort vind je hier artikelen over websitegroei, SEO en conversie.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-xl bg-gold px-6 py-3 text-sm font-medium text-black transition hover:opacity-90"
        >
          Terug naar home
        </Link>
      </div>
    </SiteShell>
  );
}