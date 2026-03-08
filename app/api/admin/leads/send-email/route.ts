import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";
import { z } from "zod";

const schema = z.object({
  leadId: z.string().uuid(),
  subject: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
});

async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  if (!process.env.SMTP_HOST) return false;
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@vdb.digital",
    to,
    subject,
    text: body,
  });
  return true;
}

export async function POST(request: Request) {
  try {
    const owner = await requireOwner();
    if (!owner) return safeJsonError("Unauthorized. Owner only.", 403);

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return safeJsonError("Invalid payload", 400);

    const lead = await prisma.lead.findUnique({ where: { id: parsed.data.leadId } });
    if (!lead) return safeJsonError("Lead not found", 404);

    const subject = parsed.data.subject ?? "Message from VDB Digital";
    const emailBody = parsed.data.body ?? `Hi ${lead.name},\n\nWe received your request and will get back to you soon.\n\nBest regards,\nVDB Digital`;

    const ok = await sendEmail(lead.email, subject, emailBody);
    if (!ok) return safeJsonError("Email service not configured or failed", 503);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Admin/Leads/SendEmail");
  }
}
