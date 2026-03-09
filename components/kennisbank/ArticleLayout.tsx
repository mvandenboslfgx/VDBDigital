import Link from "next/link";
import { ArticleContent } from "./ArticleContent";
import { getTableOfContents } from "@/lib/article-toc";

type ArticleLayoutProps = {
  title: string;
  content: string;
  author: string;
  publishedAt: Date | null;
};

export function ArticleLayout({ title, content, author, publishedAt }: ArticleLayoutProps) {
  const toc = getTableOfContents(content);

  return (
    <div className="section-container py-16 md:py-24">
      <Link
        href="/kennisbank"
        className="text-sm font-medium text-marketing-textSecondary hover:text-marketing-text transition-colors"
      >
        ← Kennisbank
      </Link>

      <div className="mx-auto mt-8 max-w-4xl">
        <header className="mb-12">
          <h1 className="text-4xl font-semibold tracking-tight text-marketing-text md:text-5xl">
            {title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-marketing-textSecondary">
            {author && <span>{author}</span>}
            {publishedAt && (
              <time dateTime={publishedAt.toISOString()}>
                {new Date(publishedAt).toLocaleDateString("nl-NL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}
          </div>
        </header>

        <div className="grid gap-12 lg:grid-cols-[1fr_240px]">
          <article className="min-w-0">
            <ArticleContent content={content} />

            {/* Internal links + CTA */}
            <nav
              className="mt-14 rounded-2xl border border-slate-200 bg-surface p-6 md:p-8"
              aria-label="Gerelateerde links"
            >
              <h2 className="text-lg font-semibold text-marketing-text">Meer ontdekken</h2>
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                <li>
                  <Link href="/website-scan" className="text-blue-600 font-medium hover:text-blue-700 hover:underline">
                    Website scan
                  </Link>
                </li>
                <li>
                  <Link href="/tools" className="text-blue-600 font-medium hover:text-blue-700 hover:underline">
                    Alle tools
                  </Link>
                </li>
                <li>
                  <Link href="/calculators" className="text-blue-600 font-medium hover:text-blue-700 hover:underline">
                    Calculators
                  </Link>
                </li>
              </ul>
              <div className="mt-8">
                <Link
                  href="/website-scan"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  Start gratis website analyse
                </Link>
              </div>
            </nav>
          </article>

          {toc.length > 0 && (
            <aside className="hidden lg:block" aria-label="Inhoud">
              <div className="sticky top-28 rounded-2xl border border-slate-200 bg-surface p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-marketing-textSecondary">
                  Inhoud
                </h2>
                <ul className="mt-4 space-y-2">
                  {toc.map((item) => (
                    <li
                      key={item.id}
                      className={item.level === 3 ? "pl-4" : ""}
                    >
                      <a
                        href={`#${item.id}`}
                        className="text-sm text-marketing-textSecondary hover:text-blue-600 transition-colors"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
