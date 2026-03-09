import type { Metadata } from "next";

const siteUrl = "https://www.vdbdigital.nl";
const siteName = "VDB Digital";

const defaultOgImage = `${siteUrl}/og-default.png`;

export function pageMetadata({
  title,
  description,
  path = "",
  noIndex = false,
  openGraphImage,
}: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  openGraphImage?: string;
}): Metadata {
  const url = path ? `${siteUrl}${path.startsWith("/") ? path : `/${path}`}` : siteUrl;
  const ogImage = openGraphImage ?? defaultOgImage;
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
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${siteName} — ${title}` }],
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
