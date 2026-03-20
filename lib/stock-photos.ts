/**
 * Stock photo URLs (Unsplash). Free to use with optional attribution.
 * Format: w=width, q=quality for responsive loading.
 */
const U = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80`;

export const stockPhotos = {
  /** Hero: laptop/workspace, digital */
  hero: U("1498050108023-c5249f4df085", 1200),
  /** Webshop / e-commerce */
  webshop: U("1556742049-0cfed4f6a45d", 600),
  /** Marketing / team collaboration */
  marketing: U("1522071820081-009f0129c71c", 600),
  /** SaaS / analytics dashboard */
  saas: U("1460925895917-afdab827c52f", 600),
  /** Professional services */
  dienstverlener: U("1573496359142-b8d87734a5a2", 600),
  /** Step 1: website / browser */
  stepWebsite: U("1499955089372-7eb0a9b60a1f", 500),
  /** Step 2: AI / data */
  stepAI: U("1620712943543-9f671e7c8f1e", 500),
  /** Step 3: report / dashboard */
  stepReport: U("1553877522-43200d972916", 500),
  /** SEO */
  seo: U("1486312338219-ce628e0a6c5e", 500),
  /** Snelheid / performance */
  speed: U("1553877522-43200d972916", 500),
  /** Conversie */
  conversion: U("1552664730-d307ca844321", 500),
  /** AI marketing */
  aiMarketing: U("1620712943543-9f671e7c8f1e", 500),
  /** Strategie */
  strategy: U("1454165804606-c063d9e3f1a2", 500),
  /** Tools / workspace */
  tools: U("1504384308090-c894fdcc538d", 800),
} as const;
