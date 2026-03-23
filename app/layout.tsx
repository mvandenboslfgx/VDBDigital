import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

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
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
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
    images: [{ url: `${siteUrl}/og-default.svg`, width: 1200, height: 630, alt: siteName }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

import { cookies } from "next/headers";
import { OrganizationStructuredData, WebSiteStructuredData, SoftwareApplicationStructuredData } from "@/components/StructuredData";
import { I18nProvider } from "@/components/I18nProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { TawkToWidget } from "@/components/TawkToWidget";
import { CommandPalette } from "@/components/CommandPalette";
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
    <html lang={locale} className="bg-slate-50">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans min-h-screen bg-slate-50 text-midnight antialiased`}
      >
        <I18nProvider locale={locale}>
          <OrganizationStructuredData />
          <WebSiteStructuredData />
          <SoftwareApplicationStructuredData />
          <div className="relative min-h-screen overflow-hidden bg-slate-50">
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(79,70,229,0.06),transparent_50%)]" />
            {children}
          </div>
          <TawkToWidget />
          <CommandPalette />
          <Analytics />
          <SpeedInsights />
        </I18nProvider>
      </body>
    </html>
  );
}

