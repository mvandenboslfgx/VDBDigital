import { prisma } from "@/lib/prisma";
import { generateSiteStructure } from "@/modules/ai-builder/logic";
import type { SiteStructure } from "@/modules/ai-builder/types";
import type { DeployInput, DeployResult } from "./types";

const baseUrl =
  process.env.SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://vdb.digital");

export async function deployWebsite(input: DeployInput): Promise<DeployResult> {
  try {
    const structure = await generateSiteStructure({
      businessType: input.businessType,
      city: input.city ?? "",
      style: input.designStyle ?? "Luxe, minimalistisch",
      services: input.services ?? [],
    });

    let previewUrl: string | undefined;
    let deploymentId: string | undefined;

    if (input.clientId) {
      const domain = input.businessType.toLowerCase().replace(/\s+/g, "-").slice(0, 30);
      const website = await prisma.website.create({
        data: {
          domain: `${domain}.vdb.digital`,
          previewUrl: `${baseUrl}/preview/${domain}-${Date.now().toString(36)}`,
          status: "draft",
          clientId: input.clientId,
          projectId: input.projectId ?? undefined,
        },
      });
      previewUrl = website.previewUrl ?? undefined;
      deploymentId = website.id;
    } else {
      const slug = input.businessType.toLowerCase().replace(/\s+/g, "-").slice(0, 20);
      previewUrl = `${baseUrl}/preview/${slug}-${Date.now().toString(36)}`;
    }

    return {
      success: true,
      previewUrl,
      deploymentId,
      message: "Website-structuur gegenereerd. Preview beschikbaar.",
      siteStructure: structure as unknown,
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[Deploy] Unexpected error", error);
    }
    return {
      success: false,
      message: "Deploy mislukt. Probeer het later opnieuw.",
    };
  }
}
