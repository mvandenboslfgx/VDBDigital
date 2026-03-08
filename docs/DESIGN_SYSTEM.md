# VDB Digital – Premium SaaS Design System

Zakelijk Nederlands, neutrale software-kleurstijl, subtiele animaties.

## Kleuren

| Gebruik        | Hex       | Tailwind / token        |
|----------------|-----------|--------------------------|
| Achtergrond    | `#F5F7FB` | `bg-marketing-bg`        |
| Vlak / cards   | `#FFFFFF` | `bg-white`               |
| Randen        | `#E5E7EB` | `border-gray-200`       |
| Primair       | `#4F46E5` | `indigo-600` / `saas-primary` |
| Accent        | `#7C3AED` | `saas-accent`           |
| Tekst primair | `#0F172A` | `text-slate-900`        |
| Tekst secundair | `#64748B` | `text-slate-600`       |

## Componenten

- **Buttons:** Primary `bg-indigo-600 hover:bg-indigo-700`, secondary `border border-gray-300 bg-white hover:bg-gray-50`, `rounded-xl`, hover scale 1.04.
- **Cards:** `bg-white border border-gray-200 rounded-2xl shadow-saas-card p-8`, hover `shadow-saas-card-hover`, optioneel `scale-1.03`.
- **Forms:** `rounded-xl border border-gray-200`, focus `ring-2 ring-indigo-500`.

## Animaties (Framer Motion)

- **Hero:** opacity 0→1, translateY 30→0, duration 0.7s.
- **Cards hover:** scale 1.03, shadow-xl.
- **Pricing cards:** hover lift `-translate-y-1.5`.
- **Buttons:** hover scale 1.04.
- **Audit score:** count-up (ScoreRing, 0→score).

## Taal

Alle gebruikersgerichte teksten in **zakelijk Nederlands** (u-vorm):  
"uw website", "Start gratis website-analyse", "Ontgrendel het volledige rapport", enz.

## Toegepaste pagina’s

- `/` (Hero, secties, footer)
- `/website-scan`
- `/prijzen`
- `/dashboard` (+ layout, nav, widgets)
- Auditresultaten (WebsiteAuditTool, ResultPanel, upsell)
- Tools-pagina’s (Input, Button, ResultPanel)
