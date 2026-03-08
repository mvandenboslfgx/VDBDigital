# VDB Digital – Laatste 5 checks (CTO final review)

Doe deze **echt nog even** vóór of direct na launch. Dit zijn de dingen die vaak misgaan.

---

## 1. Test audit op een echte site

Test bijvoorbeeld:

- https://bol.com
- https://nu.nl
- https://coolblue.nl

**Controleer:**

- Score wordt berekend
- Insights zijn gevuld
- Recommendations-array is aanwezig

Als de AI geen output geeft → er is nu een **fallback** (basisanalyse + vaste aanbevelingen). Controleer dat die zichtbaar is.

---

## 2. Test upgrade flow volledig

Doe **één testbetaling** met Stripe testmode.

**Flow:**

```
/prijzen → checkout → betaling → webhook → dashboard plan upgrade
```

**Controleer:** gebruiker kan daarna **meer audits** doen (planlimit hoger).

---

## 3. OpenAI-fouten / fallback

AI-endpoints hebben een fallback:

- Lege of korte AI-output → `lib/ai-website-audit.ts` vult in met standaardtekst en aanbevelingen.
- API response bevat altijd `insights` en `recommendations` (array).
- Frontend toont fallbacktekst als summary leeg is.

Bij problemen: kijk in **Vercel → Logs → Functions** naar OpenAI/timeout errors.

---

## 4. Vercel logs

Na launch even kijken:

**Vercel → Project → Logs → Functions**

Let op:

- API errors
- OpenAI errors
- Webhook issues (Stripe)

---

## 5. Test mobiel

Veel verkeer is mobiel. Controleer op telefoon:

- `/website-scan` – formulier + CTA goed zichtbaar
- `/prijzen` – overzicht en knoppen
- Resultaatpagina (na scan) – score + upsell-blok leesbaar

**CTA moet mobiel zichtbaar blijven** (niet weggesneden of te klein).

---

# Eerste traffic – LinkedIn post

Gebruik bijvoorbeeld:

```
Ik heb een AI tool gebouwd die analyseert waarom websites geen klanten opleveren.

Je krijgt direct:
• SEO analyse
• snelheid analyse
• conversie verbeterpunten

Gratis te testen:

https://www.vdbdigital.nl/website-scan
```

---

# Groei – 3 dingen met grootste impact

## 1. Programmatic SEO

Nieuwe pagina’s kunnen veel verkeer opleveren:

- `/seo-analyse`
- `/website-analyse`
- `/seo-check`
- `/conversie-check`

(Deels al aanwezig via `/seo/[slug]`; uitbreiden waar nodig.)

## 2. Audit caching

Veel gebruikers scannen dezelfde sites. Cache per URL (bijv. 24 uur):

- Database: `AuditCache` (url, result, score, createdAt)
- Of Redis-key per URL met TTL

## 3. Deelbare rapporten

Gebruiker deelt link naar rapport:

- Bijv. `/audit/example.com` of `/rapport/[slug]`
- Levert gratis SEO-verkeer en virale groei

---

---

# Canonical redirect

**vdbdigital.nl → www.vdbdigital.nl** (301) staat in middleware. Zo voorkom je SEO-duplicatie. Zorg in Vercel dat beide domeinen aan het project gekoppeld zijn.

# Sitemap

**https://www.vdbdigital.nl/sitemap.xml** bevat o.a.:

- `/`
- `/website-scan`
- `/prijzen`
- `/kennisbank`
- `/gratis-website-scan`
- overige routes

# Audit timeout

De route `/api/ai/website-audit` heeft `maxDuration = 30` (seconden) zodat langere scans niet door Vercel worden afgebroken.

---

*Status: production-ready SaaS MVP. Deze checks + groei-ideeën maken de launch en eerste maanden robuust.*
