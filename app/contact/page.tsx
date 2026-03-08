import SiteShell from "@/components/SiteShell";
import PageTransition from "@/components/PageTransition";
import PageHero from "@/components/PageHero";
import Contact from "@/components/Contact";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Neem contact op met VDB Digital. Vragen over website-analyse, prijzen of een plan op maat? We reageren zo snel mogelijk.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <SiteShell>
      <PageTransition>
        <PageHero
          eyebrow="CONTACT"
          title="Neem contact met ons op."
          subtitle="Heeft u vragen over website-analyse, prijzen of een plan op maat? Deel uw gegevens en we reageren zo snel mogelijk."
        />
        <Contact />
      </PageTransition>
    </SiteShell>
  );
}
