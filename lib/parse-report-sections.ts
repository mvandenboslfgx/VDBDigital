/**
 * Parse AI audit report summary into sections (Dutch headings).
 */

const SECTION_HEADERS = [
  "## Belangrijkste problemen",
  "## Aanbevolen verbeteringen",
  "## Geschatte groeikans",
] as const;

export type ReportSectionKey = "problemen" | "verbeteringen" | "groeikans";

export interface ReportSections {
  problemen: string;
  verbeteringen: string;
  groeikans: string;
  raw: string;
}

export function parseReportSections(summary: string): ReportSections | null {
  const raw = summary.trim();
  const problemenIdx = raw.indexOf(SECTION_HEADERS[0]);
  const verbeteringenIdx = raw.indexOf(SECTION_HEADERS[1]);
  const groeikansIdx = raw.indexOf(SECTION_HEADERS[2]);

  if (problemenIdx === -1 || verbeteringenIdx === -1 || groeikansIdx === -1) {
    return null;
  }

  const problemen = raw
    .slice(problemenIdx + SECTION_HEADERS[0].length, verbeteringenIdx)
    .trim();
  const verbeteringen = raw
    .slice(verbeteringenIdx + SECTION_HEADERS[1].length, groeikansIdx)
    .trim();
  const groeikans = raw
    .slice(groeikansIdx + SECTION_HEADERS[2].length)
    .trim();

  return { problemen, verbeteringen, groeikans, raw };
}
