"use client";

/**
 * Technical data section for audit reports. Displays verifiable crawl signals
 * so users see exactly what was measured (transparency, no black box).
 */

export interface TechnicalDataSummary {
  h1Count: number;
  h2Count: number;
  imagesMissingAlt: number;
  imageCount: number;
  internalLinks: number;
  externalLinks: number;
  canonicalPresent: boolean;
  metaDescriptionPresent: boolean;
  metaDescriptionLength: number;
  viewportPresent: boolean;
  structuredDataPresent: boolean;
  formCount: number;
  ctaCount: number;
  wordCount: number;
}

export default function TechnicalDataSection({
  data,
  scanConfidence,
}: {
  data: TechnicalDataSummary;
  scanConfidence?: number;
}) {
  const items = [
    { label: "H1-tags", value: data.h1Count },
    { label: "H2-tags", value: data.h2Count },
    { label: "Afbeeldingen zonder alt", value: data.imagesMissingAlt, total: data.imageCount },
    { label: "Interne links", value: data.internalLinks },
    { label: "Externe links", value: data.externalLinks },
    { label: "Canonical tag", value: data.canonicalPresent ? "Ja" : "Nee" },
    { label: "Meta description", value: data.metaDescriptionPresent ? `Ja (${data.metaDescriptionLength} tekens)` : "Nee" },
    { label: "Viewport meta", value: data.viewportPresent ? "Ja" : "Nee" },
    { label: "Structured data (JSON-LD)", value: data.structuredDataPresent ? "Ja" : "Nee" },
    { label: "Formulieren", value: data.formCount },
    { label: "CTA-achtige links", value: data.ctaCount },
    { label: "Woorden op pagina", value: data.wordCount },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Technische data
        </h3>
        {scanConfidence != null && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              scanConfidence >= 80
                ? "bg-emerald-500/20 text-emerald-400"
                : scanConfidence >= 50
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-red-500/20 text-red-400"
            }`}
            title="Betrouwbaarheid van de scan (o.a. of HTML en PageSpeed succesvol zijn opgehaald)"
          >
            Betrouwbaarheid {scanConfidence}%
          </span>
        )}
      </div>
      <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
        {items.map(({ label, value, total }) => (
          <div key={label} className="flex justify-between border-b border-white/5 py-1.5">
            <dt className="text-zinc-500">{label}</dt>
            <dd className="font-medium text-zinc-200">
              {typeof value === "number" && total != null && total > 0
                ? `${value} / ${total}`
                : String(value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
