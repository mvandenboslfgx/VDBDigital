# Laatste polish – VDB Digital

Overzicht van het laatste polish-pakket (tot in de puntjes) vóór/na launch.

---

## 1. Microcopy (zakelijk Nederlands)

- **Hero H1 (SEO):** "Gratis AI website analyse"
- **Subheadline:** "Ontdek waarom uw website niet optimaal presteert. Onze AI analyseert uw website op SEO, snelheid en conversie en geeft direct concrete verbeterpunten."
- **CTA:** "Start gratis analyse" (kort voor betere conversie)
- **Layout metadata:** titel "Gratis AI website analyse | VDB Digital", description afgestemd op H1 + value prop

---

## 2. Auditresultaat – verbeterpotentieel

- Nieuw blok **Verbeterpotentieel:** "Met deze verbeteringen kan uw website-score stijgen naar:" → **85/100**
- Upsell met **locked items** (🔒):
  - 🔒 Volledige SEO analyse
  - 🔒 UX verbeterpunten
  - 🔒 Conversie optimalisatie
  - 🔒 Technische fouten
  - 🔒 Prioriteitenlijst
- Knop: "Upgrade naar Pro"

---

## 3. Vertrouwen – "Voor wie is VDB Digital"

- **TrustSection** onder hero:
  - Titel: "Voor wie is VDB Digital"
  - Vier kaarten: Webshops, Marketingbureaus, SaaS bedrijven, Dienstverleners
  - Stagger-animatie (delay 0,1), hover scale 1,03 + shadow

---

## 4. Animaties

- **Buttons:** hover scale 1,05 + `will-change: transform`
- **Cards:** hover scale 1,03 + shadow-xl (Hero preview, TrustSection)
- **Secties:** stagger children (delay 0,1) in TrustSection
- **ResultPanel:** `will-change: transform` + sterkere hover-shadow (geen scale i.v.m. layout shift)

---

## 5. Dashboard – welkomblok

- **Welkom terug** bovenaan dashboard:
  - Titel: "Welkom terug"
  - Introtekst (rol-specifiek)
  - Drie mini-stats: Laatste analyse (datum), Website score (laatste rapport), Gebruik deze maand (X scans)
- Widgets: "Laatste audits", "Upgrade advies"
- Dashboard in light theme (slate, witte kaarten, indigo links)
- Upgrade-CTA voor leads: indigo i.p.v. gold

---

## 6. SEO

- Homepage H1 = "Gratis AI website analyse" (voor Google)
- Site title en description in `app/layout.tsx` hierop afgestemd

---

## 7. Social proof (later)

Wanneer er eerste gebruikers/quotes zijn, sectie toevoegen met o.a.:
- "De analyse gaf ons direct inzicht in waarom onze conversie laag was."

---

## 8. Performance

- `will-change: transform` op: Hero H1, Hero CTA-wrapper, Hero preview-kaart, Button (motion), ResultPanel

---

*Build na polish: geslaagd.*
