import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const siteUrl = "https://www.vdbdigital.nl";
const siteName = "VDB Digital";
const siteTitle = "AI Website Analyse | VDB Digital";
const siteDescription =
  "Analyseer uw website gratis met AI en ontdek hoe u meer klanten uit uw website haalt.";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName,
    type: "website",
    locale: "nl_NL",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

import { cookies } from "next/headers";
import { OrganizationStructuredData, WebSiteStructuredData } from "@/components/StructuredData";
import { I18nProvider } from "@/components/I18nProvider";
import { TawkToWidget } from "@/components/TawkToWidget";
import type { Locale } from "@/lib/i18n";

const VALID_LOCALES: Locale[] = ["nl", "en", "de"];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale =
    localeCookie && VALID_LOCALES.includes(localeCookie as Locale)
      ? (localeCookie as Locale)
      : "nl";

  return (
    <html lang={locale} className="bg-[#F5F7FB]">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans min-h-screen bg-[#F5F7FB] text-slate-900 antialiased`}
      >
        <I18nProvider locale={locale}>
          <OrganizationStructuredData />
          <WebSiteStructuredData />
          <div className="relative min-h-screen overflow-hidden bg-[#F5F7FB]">
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(37,99,235,0.06),transparent_50%)]" />
            {children}
          </div>
          <TawkToWidget />
        </I18nProvider>
      </body>
    </html>
  );
}

