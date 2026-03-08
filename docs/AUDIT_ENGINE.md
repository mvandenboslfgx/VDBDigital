# Deterministic Website Audit Engine

The scan system is split into three layers. **Scores are never from AI**; AI only generates explanations.

## Architecture

1. **Data collection** – Fetch HTML, parse DOM, collect signals.
2. **Performance data** – Call PageSpeed API (LCP, CLS, INP, TTFB, score); fallback when API fails.
3. **Score calculation** – Pure functions: same signals → same scores.
4. **AI insights** – Read-only: AI gets signals + scores and produces human explanations and recommendations.

## Layer 1: Data collection

- **Module**: `modules/audit/crawler.ts`
- **Function**: `collectSignals(rawUrl, timeoutMs?)` → `CrawlResult`
- **Signals**: `title`, `metaDescription`, `h1Count`, `h2Count`, `imageCount`, `imagesWithoutAlt`, `internalLinks`, `externalLinks`, `canonicalTag`, `robotsMeta`, `viewportMeta`, `structuredData`, `formCount`, `ctaCount`, `wordCount`
- **Errors**: `INVALID_URL`, `TIMEOUT`, `BLOCKED`, `FETCH_ERROR` with user-facing messages.

## Layer 2: Performance data

- **Module**: `modules/audit/performance.ts`
- **Function**: `fetchPerformanceData(url)` → `PerformanceData | null`
- **Returns**: `lcp`, `cls`, `inp`, `ttfb`, `performanceScore` (all nullable if API fails).
- **Fallback**: When null, Layer 3 uses HTML-based heuristics for performance score.

## Layer 3: Score calculation

- **Module**: `modules/audit/scoring.ts`
- **Functions**:
  - `calculateSeoScore(signals)` – title, meta, H1, image alt, canonical, links, structured data, viewport.
  - `calculateUXScore(signals)` – headings, links, word count, image alt, viewport.
  - `calculateConversionScore(signals)` – CTAs, forms, title, meta, H1, internal links.
  - `calculatePerformanceScore(signals, performanceData)` – PageSpeed score when available, else heuristic.
- **Output**: All scores 0–100, clamped. Deterministic and reproducible.

## AI insight generation

- **Module**: `modules/audit/insights.ts`
- **Function**: `generateAiInsights(signals, scores, technical, fullReport)` → `{ summary, summaryShort? }`
- AI receives only signals and scores; it does not compute scores.

## Scan confidence

- **Field**: `scanConfidence` (0–100).
- **Logic**: 100 when HTML fetch and PageSpeed succeed; reduced when PageSpeed fails or data is partial.
- **Display**: Shown in report “Technical data” section (e.g. “Betrouwbaarheid 80%”).

## Scan flow

- **Entry**: `runFullWebsiteAudit(url, fullReport)` in `lib/ai-website-audit.ts` (facade).
- **Pipeline**: `runScan()` in `modules/audit/run-scan.ts`: collect → performance → scores → technical summary → AI insights.
- **Queue**: BullMQ worker uses `runFullWebsiteAudit`; same deterministic pipeline.

## Transparency

- **Technical data section**: Report UI shows H1 count, images missing alt, internal/external links, canonical, meta description, viewport, structured data, forms, CTAs, word count.
- **Re-run**: “Scan opnieuw” clears result; same URL produces same scores (deterministic).

## Testing

- **Scoring tests**: `npm run test:audit-scoring` (or `npx tsx modules/audit/__tests__/scoring.test.ts`).
- Tests assert score ranges and that identical inputs yield identical scores.

## New files

| File | Purpose |
|------|---------|
| `modules/audit/types.ts` | `CrawlSignals`, `PerformanceData`, `AuditScores`, `ScanResult`, `TechnicalDataSummary`, `CrawlResult` |
| `modules/audit/crawler.ts` | `collectSignals()` – fetch + parse, return signals or error |
| `modules/audit/performance.ts` | `fetchPerformanceData()` – PageSpeed LCP/CLS/INP/TTFB/score |
| `modules/audit/scoring.ts` | `calculateSeoScore`, `calculateUXScore`, `calculateConversionScore`, `calculatePerformanceScore`, `buildTechnicalSummary`, `calculateAllScores` |
| `modules/audit/insights.ts` | `generateAiInsights()` – AI explanations only |
| `modules/audit/run-scan.ts` | `runScan()` – full pipeline, confidence, optional AI |
| `components/tools/TechnicalDataSection.tsx` | Report UI for technical data + confidence |
| `modules/audit/__tests__/scoring.test.ts` | Deterministic scoring tests |

## Modified files

- `lib/ai-website-audit.ts` – Facade: calls `runScan`, maps to `FullAuditResult` (legacy shape), exports `computeLeadScore`, `collectSignals`.
- `modules/leads/auditLead.ts` – Persist `technicalData` and `scanConfidence` on `AuditReport`.
- `app/api/ai/website-audit/route.ts` – Response includes `scanConfidence`, `technicalSummary`.
- `components/tools/WebsiteAuditTool.tsx` – Technical data section, “Scan opnieuw” button.
- `app/dashboard/reports/[id]/page.tsx` – Technical data panel when stored; “Scan opnieuw” copy.
- `prisma/schema.prisma` – `AuditReport.technicalData`, `AuditReport.scanConfidence`.
- `prisma/migrations/20260309100000_audit_technical_confidence/migration.sql` – New columns.
