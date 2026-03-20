/**
 * BullMQ handler: generate meta/H1 preview and persist on WebsiteFix.
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateMetaH1Fix } from "./ai-meta-h1";
import { websiteFixInputSchema, type WebsiteFixPayloadStored } from "./fix-contract";

export async function processWebsiteFixJob(websiteFixId: string): Promise<{ websiteFixId: string }> {
  const row = await prisma.websiteFix.findUnique({
    where: { id: websiteFixId },
    include: {
      websiteAudit: { include: { websiteProject: true } },
    },
  });
  if (!row) {
    throw new Error("WebsiteFix not found");
  }
  if (!row.websiteAudit?.websiteProject) {
    throw new Error("WebsiteFix no longer linked to a project");
  }

  await prisma.websiteFix.update({
    where: { id: websiteFixId },
    data: { status: "processing", errorMessage: null },
  });

  try {
    const rawPayload = row.payload as unknown;
    const base = rawPayload as WebsiteFixPayloadStored;
    const inputParsed = websiteFixInputSchema.safeParse(base.input);
    if (!inputParsed.success) {
      throw new Error("Invalid fix payload input");
    }

    const applied = await generateMetaH1Fix(inputParsed.data);
    const nextPayload: WebsiteFixPayloadStored = {
      input: inputParsed.data,
      applied,
    };

    await prisma.websiteFix.update({
      where: { id: websiteFixId },
      data: {
        status: "preview_ready",
        payload: JSON.parse(JSON.stringify(nextPayload)) as Prisma.InputJsonValue,
      },
    });

    return { websiteFixId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await prisma.websiteFix.update({
      where: { id: websiteFixId },
      data: {
        status: "failed",
        errorMessage: msg.slice(0, 2000),
      },
    });
    throw e;
  }
}
