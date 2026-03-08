import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | VDB Digital",
  description: "Cookie policy and use of cookies on VDB Digital.",
};

export default function CookiePolicyPage() {
  return (
    <SiteShell>
      <div className="section-container py-16">
        <h1 className="section-heading">Cookie Policy</h1>
        <h2 className="section-title mt-2">Use of cookies</h2>
        <div className="prose prose-invert mt-8 max-w-none space-y-6 text-gray-300">
          <p className="text-sm leading-relaxed">
            Last updated: {new Date().toLocaleDateString("nl-NL")}. This cookie policy explains how
            VDB Digital (&quot;we&quot;) uses cookies and similar technologies on our website, in
            line with the ePrivacy Directive and GDPR.
          </p>
          <section>
            <h3 className="text-lg font-semibold text-white">1. What are cookies?</h3>
            <p className="mt-2 text-sm">
              Cookies are small text files stored on your device when you visit a website. They help
              the site remember your preferences, keep you logged in, and improve performance.
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-white">2. Cookies we use</h3>
            <p className="mt-2 text-sm">
              We use strictly necessary cookies for authentication and security (e.g. session and
              login state). We may use analytics or functional cookies to improve the site; these
              will be described here and can be managed via your browser or our consent tool if
              applicable.
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-white">3. Legal basis and retention</h3>
            <p className="mt-2 text-sm">
              Necessary cookies are used on the basis of legitimate interest. Other cookies may
              require your consent. We retain cookie data only as long as needed for the purposes
              described.
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-white">4. Your choices</h3>
            <p className="mt-2 text-sm">
              You can block or delete cookies via your browser settings. Note that blocking
              necessary cookies may affect login and core site functionality.
            </p>
          </section>
          <p className="mt-6">
            <Link href="/privacy-policy" className="text-gold hover:underline">
              Privacy Policy
            </Link>
            {" · "}
            <Link href="/legal-notice" className="text-gold hover:underline">
              Legal Notice
            </Link>
          </p>
          <p className="mt-8 text-xs text-gray-500">
            This is a GDPR-compliant placeholder. Replace with your full cookie policy and have it
            reviewed by a legal professional.
          </p>
        </div>
      </div>
    </SiteShell>
  );
}
