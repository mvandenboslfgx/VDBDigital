import nodemailer from "nodemailer";
import { env } from "./env";

const isProduction = process.env.NODE_ENV === "production";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  tls: {
    ciphers: "TLSv1.2",
    rejectUnauthorized: isProduction,
  },
});

type BaseMailParams = {
  to: string;
  subject: string;
  heading: string;
  intro: string;
  detailLines?: string[];
};

const renderHtmlEmail = ({
  heading,
  intro,
  detailLines = [],
}: Omit<BaseMailParams, "to" | "subject">) => {
  const details =
    detailLines.length > 0
      ? `<ul style="margin:16px 0 0;padding:0;list-style:none;font-size:14px;line-height:1.6;color:#e5e5e5;">
  ${detailLines
    .map(
      (line) =>
        `<li style="margin:4px 0;">${line
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</li>`
    )
    .join("")}
</ul>`
      : "";

  return `<!doctype html>
<html lang="nl">
  <body style="margin:0;padding:0;background-color:#050505;color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;border-radius:24px;background:radial-gradient(circle at top left,#1f2937,#020617);border:1px solid rgba(198,169,93,0.4);box-shadow:0 24px 60px rgba(0,0,0,0.85);">
            <tr>
              <td style="padding:32px 32px 16px;">
                <h1 style="margin:0;font-size:24px;letter-spacing:0.18em;text-transform:uppercase;color:#d1d5db;font-weight:500;">VDB Digital</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 8px;">
                <h2 style="margin:0;font-size:22px;color:#f9fafb;font-weight:600;">${heading
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")}</h2>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 8px;">
                <p style="margin:0;font-size:14px;line-height:1.7;color:#d1d5db;">${intro
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px;">
                ${details}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 32px;border-top:1px solid rgba(148,163,184,0.35);">
                <p style="margin:0;font-size:12px;color:#9ca3af;">You’re receiving this email because a form was submitted on <span style="color:#e5e7eb;">vdb.digital</span>.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const sendLuxuryEmail = async (params: BaseMailParams) => {
  const html = renderHtmlEmail(params);

  await transporter.sendMail({
    from: env.ADMIN_EMAIL,
    to: params.to,
    subject: params.subject,
    html,
  });
};

export const sendContactUserConfirmation = async (args: {
  name: string;
  email: string;
}) => {
  await sendLuxuryEmail({
    to: args.email,
    subject: "We hebben je projectaanvraag ontvangen · VDB Digital",
    heading: "Dank voor je bericht.",
    intro: `Hi ${args.name}, we hebben je projectdetails ontvangen en ons team bekijkt alles zorgvuldig voordat we bij je terugkomen.`,
    detailLines: [
      "Je kunt meestal binnen één werkdag een reactie verwachten.",
      "Als jij dit niet was, kun je deze e-mail veilig negeren.",
    ],
  });
};

export const sendContactAdminNotification = async (args: {
  name: string;
  email: string;
  company?: string;
  message: string;
}) => {
  await sendLuxuryEmail({
    to: env.ADMIN_EMAIL,
    subject: "Nieuwe projectaanvraag · VDB Digital",
    heading: "Nieuwe projectaanvraag ontvangen.",
    intro: "Een nieuwe high-intent lead heeft zojuist het contactformulier ingevuld.",
    detailLines: [
      `Naam: ${args.name}`,
      `Email: ${args.email}`,
      args.company ? `Bedrijf: ${args.company}` : "",
      `Bericht: ${args.message}`,
    ].filter(Boolean),
  });
};

export const sendPreviewRequestAdminNotification = async (args: {
  businessName: string;
  industry: string;
  colorPreference: string;
  style: string;
}) => {
  await sendLuxuryEmail({
    to: env.ADMIN_EMAIL,
    subject: "Nieuwe preview-aanvraag · VDB Digital",
    heading: "Nieuwe previewdesign aangevraagd.",
    intro: "Een bezoeker heeft een op maat gemaakte websitepreview aangevraagd.",
    detailLines: [
      `Bedrijfsnaam: ${args.businessName}`,
      `Sector: ${args.industry}`,
      `Kleurvoorkeur: ${args.colorPreference}`,
      `Stijl: ${args.style}`,
    ],
  });
};

