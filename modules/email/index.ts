/**
 * Email module: welcome, upgrade confirmation, audit report.
 * Uses lib/email and SMTP from env.
 */

import { sendAuditReportEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

export interface UserForEmail {
  email: string;
  id?: string;
}

export interface AuditReportForEmail {
  website: string;
  summary: string;
  seoScore: number;
  perfScore: number;
  uxScore: number;
  convScore: number;
}

async function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  const nodemailer = await import("nodemailer");
  return nodemailer.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
}

const FROM = process.env.SMTP_FROM || "noreply@vdb.digital";

/**
 * Send welcome email after signup.
 */
export async function sendWelcomeEmail(user: UserForEmail): Promise<boolean> {
  const transporter = await getTransporter();
  if (!transporter) {
    logger.info("[Email] Welcome (no SMTP)", { to: user.email.slice(0, 3) + "***" });
    return false;
  }
  try {
    await transporter.sendMail({
      from: FROM,
      to: user.email,
      subject: "Welcome to VDB Digital",
      text: `Welcome to VDB Digital. Log in to your dashboard to run website audits, use AI tools, and more.`,
    });
    return true;
  } catch (e) {
    logger.warn("[Email] Welcome send failed", { to: user.email.slice(0, 3) + "***", error: String(e) });
    return false;
  }
}

/**
 * Send upgrade confirmation after plan change.
 */
export async function sendUpgradeConfirmation(user: UserForEmail & { planName?: string }): Promise<boolean> {
  const transporter = await getTransporter();
  if (!transporter) {
    logger.info("[Email] Upgrade confirmation (no SMTP)", { to: user.email.slice(0, 3) + "***" });
    return false;
  }
  try {
    const planText = user.planName ? `Your plan: ${user.planName}.` : "Your plan has been updated.";
    await transporter.sendMail({
      from: FROM,
      to: user.email,
      subject: "Your plan has been updated · VDB Digital",
      text: `Thank you for upgrading. ${planText} You can manage your subscription in the dashboard.`,
    });
    return true;
  } catch (e) {
    logger.warn("[Email] Upgrade confirmation failed", { to: user.email.slice(0, 3) + "***", error: String(e) });
    return false;
  }
}

/**
 * Send audit report to email. Wraps lib/email.sendAuditReportEmail.
 */
export async function sendAuditReport(email: string, report: AuditReportForEmail): Promise<boolean> {
  return sendAuditReportEmail({
    to: email,
    website: report.website,
    summary: report.summary,
    seoScore: report.seoScore,
    perfScore: report.perfScore,
    uxScore: report.uxScore,
    convScore: report.convScore,
  });
}
