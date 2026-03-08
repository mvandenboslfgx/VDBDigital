import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | VDB Digital",
  description: "Privacy policy and data protection information for VDB Digital.",
};

export default function PrivacyPolicyPage() {
  return (
    <SiteShell>
      <div className="section-container py-16">
        <h1 className="section-heading">Privacy Policy</h1>
        <h2 className="section-title mt-2">Data protection &amp; your privacy</h2>
        <div className="prose prose-invert mt-8 max-w-none space-y-6 text-gray-300">
          <p className="text-sm leading-relaxed">
            Last updated: {new Date().toLocaleDateString("nl-NL")}. This privacy policy explains how VDB Digital (&quot;we&quot;, &quot;us&quot;) collects, uses and protects your personal data when you use our website and services, in accordance with the GDPR (General Data Protection Regulation).
          </p>
          <section>
            <h3 className="text-lg font-semibold text-white">1. Controller</h3>
            <p className="mt-2 text-sm">
              The data controller responsible for your data is VDB Digital. You can contact us at the email address provided on our contact page or in the legal notice.
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-white">2. Data we collect</h3>
            <p className="mt-2 text-sm">
              We may collect: name, email address, company name, and messages you send via contact forms; account data if you use our client portal; usage data (e.g. IP, browser) for security and analytics. We do not sell your data.
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-white">3. Legal basis &amp; purposes</h3>
            <p className="mt-2 text-sm">
              We process your data on the basis of consent, contract performance, or legitimate interest (e.g. improving our services, security). We use it to respond to enquiries, manage projects and invoices, send review requests and (if you opted in) newsletters.
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-white">4. Retention</h3>
            <p className="mt-2 text-sm">
              We retain your data only as long as necessary for the purposes above or as required by law. You may request deletion or a copy of your data at any time.
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-white">5. Your rights</h3>
            <p className="mt-2 text-sm">
              Under the GDPR you have the right to access, rectify, erase, restrict processing, data portability and to object. You may also lodge a complaint with a supervisory authority. Contact us for any request.
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-white">6. Cookies &amp; third parties</h3>
            <p className="mt-2 text-sm">
              We use necessary cookies for authentication and security. We may use analytics or third-party services (e.g. email delivery); their use of data is governed by their own policies. We use Supabase for authentication and database hosting.
            </p>
          </section>
          <p className="mt-6">
            <Link href="/legal-notice" className="text-gold hover:underline">Legal Notice</Link>
            {" · "}
            <Link href="/cookie-policy" className="text-gold hover:underline">Cookie Policy</Link>
          </p>
          <p className="mt-8 text-xs text-gray-500">
            This is a placeholder. Replace with your full legal text and have it reviewed by a qualified professional.
          </p>
        </div>
      </div>
    </SiteShell>
  );
}
