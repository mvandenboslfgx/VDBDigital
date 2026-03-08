import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Notice | VDB Digital",
  description: "Legal notice and imprint for VDB Digital.",
};

export default function LegalNoticePage() {
  return (
    <SiteShell>
      <div className="section-container py-16">
        <h1 className="section-heading">Legal Notice</h1>
        <h2 className="section-title mt-2">Imprint &amp; provider information</h2>
        <div className="prose prose-invert mt-8 max-w-none space-y-6 text-gray-300">
          <p className="text-sm leading-relaxed">
            In accordance with applicable law, we provide the following information about the operator of this website.
          </p>
          <section>
            <h3 className="text-lg font-semibold text-white">Provider / Responsible</h3>
            <p className="mt-2 text-sm">
              VDB Digital<br />
              [Your business address]<br />
              [Postal code and city]<br />
              [Country]
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <p className="mt-2 text-sm">
              Email: Use the contact form or the email address published on the contact page.
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-white">VAT &amp; registration</h3>
            <p className="mt-2 text-sm">
              [VAT number if applicable]<br />
              [Chamber of Commerce / company registration if applicable]
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-white">Disclaimer</h3>
            <p className="mt-2 text-sm">
              We strive to keep the content of this site accurate. We do not assume liability for external links or third-party content. The content of this site is subject to Dutch/international copyright law.
            </p>
          </section>
          <p className="mt-6">
            <Link href="/privacy-policy" className="text-gold hover:underline">Privacy Policy</Link>
            {" · "}
            <Link href="/cookie-policy" className="text-gold hover:underline">Cookie Policy</Link>
          </p>
          <p className="mt-8 text-xs text-gray-500">
            This is a placeholder. Replace with your actual company details and have the text reviewed by a legal professional.
          </p>
        </div>
      </div>
    </SiteShell>
  );
}
