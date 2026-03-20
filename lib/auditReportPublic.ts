import { prisma } from "@/lib/prisma";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Public report access: shareSlug (anyone) or UUID only when viewer email matches lead (logged-in owner).
 */
export async function getAuditReportForPublicView(slug: string, viewerEmail: string | null) {
  if (UUID_REGEX.test(slug)) {
    if (!viewerEmail || !viewerEmail.trim()) return null;
    const email = viewerEmail.trim();
    const row = await prisma.auditReport.findFirst({
      where: {
        id: slug,
        lead: {
          email: {
            equals: email,
            mode: "insensitive",
          },
        },
      },
      include: { lead: true },
    });
    if (!row?.lead?.email?.trim()) return null;
    return row;
  }
  const bySlug = await prisma.auditReport
    .findFirst({ where: { shareSlug: slug }, include: { lead: true } })
    .catch(() => null);
  if (bySlug && (!bySlug.lead || !bySlug.lead.email?.trim())) return null;
  return bySlug;
}
