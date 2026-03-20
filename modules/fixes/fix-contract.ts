import { z } from "zod";
import { auditFixIssueSchema } from "@/modules/audit/fix-contract";

/** AI output: concrete meta + H1 suggestions (preview only — not live-patched). */
export const appliedMetaFixSchema = z.object({
  type: z.literal("meta_update"),
  page: z.string().min(1).max(2048),
  before: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    h1: z.string().optional(),
  }),
  after: z.object({
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(320),
    h1: z.string().min(1).max(120),
  }),
});

export type AppliedMetaFix = z.infer<typeof appliedMetaFixSchema>;

export const websiteFixInputSchema = z.object({
  pageUrl: z.string().min(1).max(2048),
  pageMeta: z.object({
    title: z.string(),
    metaDescription: z.string(),
    h1: z.string(),
  }),
  issue: auditFixIssueSchema,
});

export type WebsiteFixInput = z.infer<typeof websiteFixInputSchema>;

/** Stored JSON on WebsiteFix.payload */
export type WebsiteFixPayloadStored = {
  input: WebsiteFixInput;
  applied?: AppliedMetaFix;
};
