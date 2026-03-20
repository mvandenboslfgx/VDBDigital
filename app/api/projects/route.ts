import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeString } from "@/lib/apiSecurity";
import { createSecureRoute } from "@/lib/secureRoute";
import { websiteProjectCreateBodySchema } from "@/lib/validation";
import { z } from "zod";

/** GET: list current user's website projects */
export const GET = createSecureRoute<undefined, undefined>({
  auth: "required",
  rateLimit: "api",
  bodyMode: "none",
  logContext: "Projects/GET",
  handler: async ({ user }) => {
    const projects = await prisma.websiteProject.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { auditHistories: true } },
      },
    });
    return NextResponse.json({ projects }, { status: 200 });
  },
});

/** POST: create a website project (domain) */
export const POST = createSecureRoute<z.infer<typeof websiteProjectCreateBodySchema>, undefined>({
  auth: "required",
  csrf: true,
  rateLimit: "sensitive",
  bodyMode: "json",
  schema: websiteProjectCreateBodySchema,
  invalidInputMessage: "Ongeldige invoer.",
  logContext: "Projects/POST",
  handler: async ({ input, user }) => {
    let domain = (input.domain ?? "").trim().toLowerCase();
    domain = domain.replace(/^https?:\/\//, "").split("/")[0].replace(/^www\./, "") || domain;
    domain = sanitizeString(domain, 253);
    if (!domain) {
      return NextResponse.json({ error: "Domain is verplicht" }, { status: 400 });
    }

    const existing = await prisma.websiteProject.findUnique({
      where: { userId_domain: { userId: user!.id, domain } },
    });
    if (existing) {
      return NextResponse.json({ project: existing }, { status: 200 });
    }

    const project = await prisma.websiteProject.create({
      data: { userId: user!.id, domain },
    });
    return NextResponse.json({ project }, { status: 200 });
  },
});
