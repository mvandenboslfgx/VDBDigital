import type { Metadata } from "next";

const siteUrl = "https://www.vdbdigital.nl";
const siteName = "VDB Digital";

export function pageMetadata({
  title,
  description,
  path = "",
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const url = path ? `${siteUrl}${path.startsWith("/") ? path : `/${path}`}` : siteUrl;
  return {
    title: `${title} | ${siteName}`,
    description,
    alternates: {
      canonical: path ? (path.startsWith("/") ? path : `/${path}`) : "/",
    },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url,
      siteName,
      type: "website",
      locale: "nl_NL",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
    },
    ...(noIndex && { robots: { index: false, follow: true } }),
  };
}

export { siteUrl, siteName };
