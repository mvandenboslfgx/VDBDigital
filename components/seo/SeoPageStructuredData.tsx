import { SITE_URL } from "@/lib/seo-pages";
import type { SeoPageConfig } from "@/lib/seo-pages";

export function SeoPageStructuredData({
  slug,
  config,
}: {
  slug: string;
  config: SeoPageConfig;
}) {
  const url = `${SITE_URL}/seo/${slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: config.title,
    description: config.description,
    url,
    author: { "@type": "Organization", name: "VDB Digital", url: SITE_URL },
    publisher: { "@type": "Organization", name: "VDB Digital", url: SITE_URL },
    datePublished: "2024-01-01",
    dateModified: new Date().toISOString().split("T")[0],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VDB Digital",
    url: SITE_URL,
    description: "VDB Digital biedt AI-gestuurde website-analyses, SEO-tools en inzicht voor ondernemers en agencies.",
    sameAs: [],
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VDB Digital",
    url: SITE_URL,
    description: "Website analyse, SEO-check en marketingtools. Start een gratis analyse.",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", url: `${SITE_URL}/website-scan` },
      "query-input": "required name=url",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
    </>
  );
}
