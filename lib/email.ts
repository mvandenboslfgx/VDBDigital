/**
 * Send transactional emails. Uses nodemailer when SMTP env vars are set.
 */

import { logger } from "@/lib/logger";

type AuditEmailParams = {
  to: string;
  website: string;
  summary: string;
  seoScore: number;
  perfScore: number;
  uxScore: number;
  convScore: number;
};

export async function sendAuditReportEmail(params: AuditEmailParams): Promise<boolean> {
  const { to, website, summary, seoScore, perfScore, uxScore, convScore } = params;
  const subject = "Je website analyse is klaar";
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vdb.digital";
  const body = `
Je website analyse is klaar

Website: ${website}
Datum: ${new Date().toLocaleString("nl-NL")}

Scores:
- SEO: ${seoScore}
- Performance: ${perfScore}
- UX: ${uxScore}
- Conversie: ${convScore}

Bekijk je volledige rapport in je dashboard: ${dashboardUrl}/dashboard/reports
  `.trim();

  const transporter = process.env.SMTP_HOST
    ? await import("nodemailer").then((m) =>
        m.default.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === "true",
          auth:
            process.env.SMTP_USER && process.env.SMTP_PASS
              ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
              : undefined,
        })
      )
    : null;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@vdb.digital",
        to,
        subject,
        text: body,
      });
      return true;
    } catch (e) {
      logger.warn("[Email] Audit report send failed", { to, error: String(e) });
      return false;
    }
  }
  logger.info("[Email] Audit report (no SMTP)", { to, website });
  return false;
}

export async function sendClientAccountCreatedEmail(params: {
  to: string;
  clientName: string;
  projectName?: string;
  loginUrl?: string;
}): Promise<boolean> {
  if (process.env.SMTP_HOST) {
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: process.env.SMTP_USER && process.env.SMTP_PASS ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@vdb.digital",
        to: params.to,
        subject: "Your client account",
        text: `Hi ${params.clientName}, your account has been created.${params.projectName ? ` Project: ${params.projectName}` : ""}${params.loginUrl ? ` Log in: ${params.loginUrl}` : ""}`,
      });
      return true;
    } catch (e) {
      logger.warn("[Email] Client account email failed", { to: params.to, error: String(e) });
      return false;
    }
  }
  logger.info("[Email] Client account (no SMTP)", { to: params.to });
  return false;
}

export async function sendReviewRequestEmail(params: {
  to: string;
  clientName: string;
  projectName: string;
  reviewLink: string;
  trustpilotLink?: string;
}): Promise<boolean> {
  if (process.env.SMTP_HOST) {
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: process.env.SMTP_USER && process.env.SMTP_PASS ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@vdb.digital",
        to: params.to,
        subject: "Leave a review",
        text: `Hi ${params.clientName}, your project "${params.projectName}" is complete. Please leave a review: ${params.reviewLink}${params.trustpilotLink ? ` Or on Trustpilot: ${params.trustpilotLink}` : ""}`,
      });
      return true;
    } catch (e) {
      logger.warn("[Email] Review request failed", { to: params.to, error: String(e) });
      return false;
    }
  }
  logger.info("[Email] Review request (no SMTP)", { to: params.to });
  return false;
}
