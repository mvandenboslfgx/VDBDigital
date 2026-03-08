/**
 * AI product layer — marketing, landing page, SEO audit.
 * Re-exports for dashboard and API routes.
 */

export {
  generateMarketingStrategy,
  type MarketingStrategyResult,
} from "./marketingStrategy";
export {
  generateLandingPage,
  type LandingPageInput,
  type LandingPageResult,
} from "./landingPage";
export {
  runSeoAudit,
  type SeoAuditResult,
} from "./seoAudit";
