# SEO-groeimachine – VDB Digital

Blueprint om met programmatische SEO **1000+ toolpagina’s** te genereren en **10k–50k bezoekers/maand** te halen. Bouwt voort op de bestaande `/seo/[slug]`-engine en `lib/seo-pages.ts`.

---

## 1. Huidige basis

- **`lib/seo-pages.ts`:** centrale config voor alle `/seo/[slug]`-pagina’s.
- **Categorieën:** website-analyse, SEO-check, website-snelheid, conversie, AI marketing, steden (o.a. Amsterdam, Rotterdam).
- **~27+ slugs** → allemaal statisch gegenereerd, in sitemap, met metadata + FAQ-schema.
- **CTA:** elke pagina linkt naar `/website-scan`.

Dit is de kern: **meer slugs + meer categorieën + betere keywords = meer long-tail traffic**.

---

## 2. Doel: 1000+ pagina’s, 10k–50k bezoekers/maand

### 2.1 Pagina-typen (schaalbaar)

| Type | Voorbeeld | Hoeveelheid | Bron |
|------|-----------|-------------|------|
| **Tool + variant** | website-analyse, website-analyse-gratis, website-analyse-online | 5–15 per tool | `seo-pages.ts` (uitbreiden) |
| **Long-tail keyword** | "gratis seo check voor webshop", "website snelheid verbeteren" | 50–200 | Keywordlijst → slug + template |
| **Stad/regio** | website-analyse-amsterdam, website-analyse-rotterdam | 50–100 steden | Lijst NL steden |
| **Branche** | website-analyse-webshop, website-analyse-zzp, seo-check-mkb | 30–80 | Branchelijst |
| **Vraag / intent** | "hoe werkt een website analyse", "wat is een seo check" | 100–300 | FAQ- en uitleg-termen |
| **Tool-combinatie** | "seo en snelheid check", "conversie en ux analyse" | 20–50 | Combinaties |

**Som:** 255–745+ alleen al met deze aantallen. Met meer varianten (taal, jaar, “2025”) makkelijk **1000+**.

### 2.2 Traffic-inschatting

- Long-tail: 10–100 bezoeken/maand per pagina.
- 1000 pagina’s × gem. 20 bezoeken ≈ **20k bezoeken/maand**.
- Sterke pagina’s (website-analyse, seo-check, steden) kunnen 100–500+ doen → **10k–50k/maand** is haalbaar.

---

## 3. Technische aanpak

### 3.1 Data-driven slugs (aanbevolen)

**Optie A – Alles in code (zoals nu)**  
- Uitbreiden van `lib/seo-pages.ts` met:
  - Meer steden (bijv. top-100 NL gemeenten).
  - Meer tool-varianten (gratis, online, tool, test, check, uitleg).
  - Branches (webshop, zzp, mkb, agency).
  - Long-tail array: bv. `["gratis-seo-check-webshop", "website-snelheid-verbeteren", ...]`.
- Per slug: bestaand `SeoPageConfig` (title, description, intro, benefits, faqs), eventueel met **template** (bijv. "website-analyse", "seo-check") zodat je niet elke pagina handmatig vult.

**Optie B – Externe data (CSV/JSON/DB)**  
- Bestand of tabel: `slug`, `template`, `title`, `description`, `variant` (stad/branche/keyword).
- Build time: `getAllSeoSlugs()` leest dit bestand; `getSeoPageConfig(slug)` haalt config op (eventueel met merge uit template).
- Voordeel: niet elke wijziging in code; content/marketing kan slugs en teksten beheren.

**Aanbeveling:** start met **Optie A** (meer slugs in `seo-pages.ts` met templates), later eventueel Optie B voor zeer grote lijsten.

### 3.2 Template-systeem

In `SeoPageConfig` optioneel veld toevoegen:

- `template?: "website-analyse" | "seo-check" | "snelheid" | "conversie" | "ai" | "stad" | "branche"`.

Per template:

- Vaste intro/benefits/faqs (zoals nu per base).
- **Variabelen:** `{{city}}`, `{{branch}}`, `{{keyword}}` in title/description/intro.
- Voorbeeld: slug `website-analyse-enschede` → template "stad", city="Enschede" → title "Website analyse Enschede", description "Website analyse voor ondernemers in Enschede...".

Zo schaal je naar 100+ steden en 50+ long-tail zonder 100+ handmatige configs.

### 3.3 Sitemap en performance

- **Sitemap:** alle `/seo/[slug]` al in sitemap; bij 1000+ slugs eventueel **sitemap index** met meerdere sitemaps (bijv. `sitemap-seo-1.xml`, `sitemap-seo-2.xml`) om bestandsgrootte beperkt te houden.
- **Build:** `generateStaticParams` blijft alle slugs returnen; Next.js pre-rendert ze. Bij zeer grote aantallen: ISR of on-demand (niet nodig voor 1k–2k statische pagina’s als build tijd acceptabel is).
- **Caching:** statische pagina’s zijn al cache-vriendelijk; CDN (Vercel) doet de rest.

### 3.4 Interne links

- Elke SEO-pagina: vaste links naar `/website-scan`, `/tools`, `/prijzen`, `/kennisbank`.
- Onderaan of in sidebar: **“Gerelateerde onderwerpen”** op basis van template/categorie (bijv. andere steden, andere tools). Versterkt internal linking en crawl efficiency.

---

## 4. Contentstructuur per pagina (blijft gelijk)

Elke `/seo/[slug]` heeft (zoals nu):

1. **H1** = title (keyword-rich).
2. **Meta title + description** = uniek per slug.
3. **Intro** = 1–2 alinea’s (uitleg + waarom relevant).
4. **Voordelen** = bulletlist (3–5 punten).
5. **Voorbeeldanalyse** = korte paragraaf (wat krijgt gebruiker).
6. **CTA** = “Start gratis analyse” → `/website-scan`.
7. **FAQ** = 2–5 vragen (schema.org FAQPage).
8. **Gerelateerde links** = /website-scan, /tools, /kennisbank (+ optioneel gerelateerde SEO-pagina’s).

Voor 1000+ pagina’s: **templates + variabelen** zodat 90% van de content uit een basis + slug-specifieke invulling komt.

---

## 5. Keyword- en slug-uitbreiding

### 5.1 Uitbreiden in `seo-pages.ts`

- **Steden:** van 5 naar 50–100 (bijv. alle provinciehoofdsteden + grote gemeenten). Zelfde template als huidige city-pagina’s.
- **Branches:**  
  `website-analyse-webshop`, `website-analyse-zzp`, `website-analyse-mkb`, `seo-check-webshop`, …  
  Nieuwe base config “branche” met variabele `{{branch}}`.
- **Long-tail:**  
  - "website-snelheid-verbeteren", "gratis-website-check", "seo-check-doen", "conversie-website-verbeteren", "ai-website-analyse-gratis", …  
  - Lijst in code of CSV; per item een slug + korte title/description (eventueel uit template).
- **Varianten per bestaande categorie:**  
  - website-analyse: + "website-check", "website-scan-uitleg", "wat-is-website-analyse".  
  - seo-check: + "seo-check-doen", "gratis-seo-check-website", "seo-website-laten-checken".  
  Zelfde base, andere title/description.

### 5.2 Waar keywords vandaan halen

- **Google Search Console:** bestaande queries op huidige SEO-pagina’s → nieuwe slugs.
- **Keyword tools:** Ubersuggest, Ahrefs, Semrush → long-tail zoekwoorden (NL) rond "website analyse", "seo check", "website snelheid", "conversie optimalisatie".
- **People Also Ask / Suggest:** "website analyse gratis", "hoe seo checken", "website snelheid test" → direct als slug + titel gebruiken.
- **Concurrenten:** welke pagina’s ranken op jouw doeltermen → eigen varianten maken (beter, duidelijker, met CTA naar jouw tool).

---

## 6. Funnel: van traffic naar conversie

- **SEO-pagina** → uitleg + waarde → **CTA “Start gratis analyse”** → `/website-scan`.
- **Website-scan** → scan + preview → **“Upgrade naar Pro”** → `/prijzen` of checkout.
- Elke SEO-pagina is dus een **landing page** voor dezelfde tool; teksten licht aanpassen per intent (informatief vs. “ik wil nu checken”) verhoogt conversie.

Optioneel later:

- **Deelbare rapporten:** `/rapport/[id]` of `/rapport/[domein]` (bijv. voor agencies) → backlinks + extra traffic.
- **Blog/kennisbank:** artikelen die doorlinken naar `/seo/[slug]` en `/website-scan` (internal linking + extra long-tail).

---

## 7. Implementatiestappen (prioriteit)

| Fase | Actie | Geschat resultaat |
|------|--------|-------------------|
| **1** | 50–100 extra steden in `seo-pages.ts` (zelfde city-template). | +50–100 pagina’s, lokaal long-tail. |
| **2** | 20–30 branch-pagina’s (webshop, zzp, mkb, etc.) met branch-template. | +20–30 pagina’s, hogere intent. |
| **3** | 50–100 long-tail slugs (keywords uit GSC/tools) met generieke template. | +50–100 pagina’s, meer long-tail. |
| **4** | Template-systeem in code (variabelen voor stad/branch/keyword). | Schaalbaar naar 500+ zonder copy-paste. |
| **5** | Sitemap-index bij >500 slugs; “Gerelateerde onderwerpen” op elke SEO-pagina. | Betere crawl en internal link. |
| **6** | Optioneel: data uit CSV/JSON voor zeer grote lijsten (1000+). | Beheer buiten code om. |

Na fase 1–3: **~150–230 extra pagina’s** (nu ~27, totaal ~180–260).  
Door daarna template en long-tail verder uit te breiden: **500–1000+** pagina’s en richting **10k–50k bezoekers/maand** mogelijk.

---

## 8. Samenvatting

- **Huidige engine** (`/seo/[slug]`, `lib/seo-pages.ts`) is geschikt als basis voor de groeimachine.
- **Schaal** door: meer slugs (steden, branches, long-tail), **templates met variabelen**, en duidelijke **CTA naar /website-scan**.
- **Technisch:** statische generatie + sitemap (eventueel sitemap-index) + interne links; geen grote architectuurwijziging nodig.
- **Content:** vaste structuur (H1, intro, voordelen, voorbeeld, CTA, FAQ); 90% uit template + slug-specifieke titel/description.
- **Traffic:** 1000+ pagina’s × gemiddeld 20–50 bezoeken/maand = **10k–50k bezoeken/maand** als realistische bandbreedte.

Als je wilt kan de volgende stap zijn: **concrete uitbreiding van `lib/seo-pages.ts`** (bijv. 50 steden + 20 branch-slugs + template-veld) zodat je direct 70+ nieuwe pagina’s live hebt.
