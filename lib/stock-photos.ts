/**
 * Stock photo URLs (Picsum). Stable direct JPG endpoints.
 */
const P = (id: number, w = 800, h = 500) =>
  `https://picsum.photos/id/${id}/${w}/${h}.jpg`;

export const stockPhotos = {
  /** Hero: laptop/workspace, digital */
  hero: P(180, 1200, 750),
  /** Webshop / e-commerce */
  webshop: P(1060, 900, 600),
  /** Marketing / team collaboration */
  marketing: P(1027, 900, 600),
  /** SaaS / analytics dashboard */
  saas: P(1048, 900, 600),
  /** Professional services */
  dienstverlener: P(1005, 900, 600),
  /** Step 1: website / browser */
  stepWebsite: P(366, 700, 500),
  /** Step 2: AI / data */
  stepAI: P(119, 700, 500),
  /** Step 3: report / dashboard */
  stepReport: P(883, 700, 500),
  /** SEO */
  seo: P(48, 700, 500),
  /** Snelheid / performance */
  speed: P(160, 700, 500),
  /** Conversie */
  conversion: P(201, 700, 500),
  /** AI marketing */
  aiMarketing: P(180, 700, 500),
  /** Strategie */
  strategy: P(944, 700, 500),
  /** Tools / workspace */
  tools: P(903, 1100, 700),
  /** Product: TV/streaming device */
  productTvBox: P(96, 1000, 700),
  /** Product: compact streaming setup */
  productStreaming: P(292, 1000, 700),
  /** Product: accessories / cables */
  productAccessories: P(1, 1000, 700),
  /** Case study visual */
  caseStudyPreview: P(1048, 1200, 750),
} as const;
