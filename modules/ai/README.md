# AI product layer

AI modules for the VDB Digital dashboard. All logic lives here; API routes and dashboard call these modules only.

## Modules

| Module | Function | Description |
|--------|----------|-------------|
| **marketingStrategy** | `generateMarketingStrategy(businessDescription, userId?)` | Returns marketing channels, campaign ideas, positioning advice. |
| **landingPage** | `generateLandingPage(input, userId?)` | Returns headline, subheadline, sections, call-to-action. |
| **seoAudit** | `runSeoAudit(websiteUrl, userId?)` | Fetches URL, returns SEO score, missing tags, improvement suggestions. |

## Usage tracking

Each module calls `incrementAiUsage(userId, toolName)` after a successful run when `userId` is provided. API routes must enforce `canUseAiTools(user)` before calling.

## Dependencies

- `lib/openai` — OpenAI client, default model, JSON format.
- `lib/usage` — `incrementAiUsage`.

## Dashboard

`/dashboard/ai-tools` shows all AI tools. Access to the quick tools (marketing, landing page, SEO audit) is gated by `canUseAiTools(user)`; other tools link to existing routes.
