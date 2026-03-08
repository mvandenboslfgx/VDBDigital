import { COMPANY_EMAIL, LINKEDIN_URL, INSTAGRAM_URL } from "@/lib/company";

const siteUrl = "https://www.vdbdigital.nl";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VDB Digital",
  url: siteUrl,
  email: COMPANY_EMAIL,
  description:
    "VDB Digital ontwerpt en bouwt luxe, conversiegerichte websites en digitale experiences. AI-websitebuilder, SEO-audits, marketingcopy en funnel-generatie.",
  sameAs: [LINKEDIN_URL, INSTAGRAM_URL],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "VDB Digital",
  url: siteUrl,
  description:
    "Luxe websites die converteren. AI-websitebuilder, website-audits, SEO-optimalisatie en marketingfunnels.",
  publisher: { "@id": `${siteUrl}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", url: `${siteUrl}/contact` },
    "query-input": "required name=search_term_string",
  },
};

export function OrganizationStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          ...organizationSchema,
          "@id": `${siteUrl}/#organization`,
        }),
      }}
    />
  );
}

export function WebSiteStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(websiteSchema),
      }}
    />
  );
}

export function ServiceStructuredData({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${siteUrl}${url}`,
    provider: { "@id": `${siteUrl}/#organization` },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQStructuredData({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
