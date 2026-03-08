"use client";

import Link from "next/link";
import { Button } from "@/components/ui";

export interface ToolLandingSectionProps {
  title: string;
  explanation: string;
  benefits: string[];
  exampleTitle?: string;
  exampleContent?: React.ReactNode;
  toolHref: string;
  toolCta: string;
  /** Internal links for SEO */
  internalLinks?: { label: string; href: string }[];
}

export default function ToolLandingSection({
  title,
  explanation,
  benefits,
  exampleTitle,
  exampleContent,
  toolHref,
  toolCta,
  internalLinks = [],
}: ToolLandingSectionProps) {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-marketing-border bg-white p-6 shadow-marketing-card md:p-8">
        <h2 className="text-xl font-semibold text-marketing-text">Wat doet deze tool?</h2>
        <p className="mt-3 text-marketing-textSecondary leading-relaxed">{explanation}</p>
      </section>

      <section className="rounded-2xl border border-marketing-border bg-white p-6 shadow-marketing-card md:p-8">
        <h2 className="text-xl font-semibold text-marketing-text">Voordelen</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-marketing-textSecondary">
          {benefits.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </section>

      {exampleTitle && exampleContent && (
        <section className="rounded-2xl border border-marketing-border bg-marketing-surface p-6 md:p-8">
          <h2 className="text-xl font-semibold text-marketing-text">{exampleTitle}</h2>
          <div className="mt-4 text-marketing-textSecondary">{exampleContent}</div>
        </section>
      )}

      <section className="rounded-2xl border border-gold/30 bg-gold/5 p-6 md:p-8">
        <h2 className="text-lg font-semibold text-marketing-text">Direct aan de slag</h2>
        <p className="mt-2 text-sm text-marketing-textSecondary">
          Vul je gegevens in hieronder en ontvang direct resultaat.
        </p>
        <Link href={toolHref} className="mt-4 inline-block">
          <Button size="lg">{toolCta}</Button>
        </Link>
      </section>

      {internalLinks.length > 0 && (
        <nav className="rounded-2xl border border-marketing-border bg-white p-6" aria-label="Gerelateerde pagina&apos;s">
          <h2 className="text-sm font-semibold text-marketing-textSecondary">Lees ook</h2>
          <ul className="mt-3 flex flex-wrap gap-4">
            {internalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-gold hover:text-goldHover hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
