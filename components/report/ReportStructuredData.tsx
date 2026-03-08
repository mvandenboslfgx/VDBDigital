import type { ReactNode } from "react";

interface ReportStructuredDataProps {
  domain: string;
  score: number;
  seoScore: number;
  perfScore: number;
  uxScore: number;
  convScore: number;
  url: string;
  reportUrl: string;
}

export function ReportStructuredData({
  domain,
  score,
  seoScore,
  perfScore,
  uxScore,
  convScore,
  url,
  reportUrl,
}: ReportStructuredDataProps): ReactNode {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `Website audit: ${domain} — Score ${score}/100`,
    description: `Website-auditresultaat voor ${domain}. SEO ${seoScore}, Performance ${perfScore}, UX ${uxScore}, Conversie ${convScore}.`,
    url: reportUrl,
    author: { "@type": "Organization", name: "VDB Digital", url: "https://vdb.digital" },
    publisher: { "@type": "Organization", name: "VDB Digital", url: "https://vdb.digital" },
    mainEntityOfPage: { "@type": "WebPage", "@id": reportUrl },
    about: { "@type": "Thing", name: "Website audit", description: "SEO, performance, UX en conversie-analyse" },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
