import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateOrigin, sanitizeString } from "@/lib/apiSecurity";

/** GET: list current user's website projects */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }
  const projects = await prisma.websiteProject.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { auditHistories: true } },
    },
  });
  return NextResponse.json({ projects });
}

/** POST: create a website project (domain) */
export async function POST(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as { domain?: string };
  let domain = (body.domain ?? "").trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//, "").split("/")[0].replace(/^www\./, "") || domain;
  domain = sanitizeString(domain, 253);
  if (!domain) {
    return NextResponse.json({ error: "Domain is verplicht" }, { status: 400 });
  }

  const existing = await prisma.websiteProject.findUnique({
    where: { userId_domain: { userId: user.id, domain } },
  });
  if (existing) {
    return NextResponse.json({ project: existing });
  }

  const project = await prisma.websiteProject.create({
    data: { userId: user.id, domain },
  });
  return NextResponse.json({ project });
}
