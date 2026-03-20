import { z } from "zod";
import type { WebsiteFixPayloadStored } from "./fix-contract";

/** Result stored in WebsiteFix.applyResult after Apply v1 (export mode). */
export const applyResultV1Schema = z.object({
  type: z.literal("meta_update"),
  /** True when export bundle is ready for the user (v1: always true on success). */
  applied: z.boolean(),
  mode: z.literal("export_v1"),
  details: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    h1: z.string().optional(),
  }),
  pageUrl: z.string().optional(),
  instructionsNl: z.string().optional(),
  /** ISO bundle for download / webhook later */
  exportedAt: z.string().optional(),
});

export type ApplyResultV1 = z.infer<typeof applyResultV1Schema>;

export function buildApplyResultExportV1(
  payload: WebsiteFixPayloadStored
): ApplyResultV1 | null {
  const meta = payload.applied;
  if (!meta || meta.type !== "meta_update" || !meta.after) return null;
  const { after } = meta;
  return {
    type: "meta_update",
    applied: true,
    mode: "export_v1",
    details: {
      title: after.title,
      description: after.description,
      h1: after.h1,
    },
    pageUrl: meta.page,
    instructionsNl:
      "Kopieer titel, meta description en H1 naar je CMS of sitebuilder. Controleer op je live pagina. " +
      "V1 levert geen automatische live-mutatie; webhook/CMS volgt later.",
    exportedAt: new Date().toISOString(),
  };
}
