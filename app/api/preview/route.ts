import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPreviewRequestAdminNotification } from "@/lib/mailer";
import { logger } from "@/lib/logger";
import { sanitizeString } from "@/lib/apiSecurity";
import { createSecureRoute } from "@/lib/secureRoute";
import { previewRequestBodySchema } from "@/lib/validation";
import { z } from "zod";

export const POST = createSecureRoute<z.infer<typeof previewRequestBodySchema>, undefined>({
  auth: "optional",
  csrf: true,
  rateLimit: "sensitive",
  bodyMode: "auto",
  schema: previewRequestBodySchema,
  invalidInputMessage: "Ongeldige invoer.",
  logContext: "Preview/POST",
  handler: async ({ input }) => {
    try {
      // Honeypot anti-bot: if set, acknowledge without saving.
      if (input.botField && input.botField.trim().length > 0) {
        return NextResponse.json(
          {
            success: true,
            message: "Thank you. Your preview request has been received for review.",
          },
          { status: 200 }
        );
      }

      const businessName = sanitizeString(input.businessName ?? "", 120);
      const industry = sanitizeString(input.industry ?? "", 120);
      const colorPreference = sanitizeString(input.colorPreference ?? "", 120);
      const style = sanitizeString(input.style ?? "Luxury", 40);

      if (!businessName || !industry) {
        return NextResponse.json({ success: false, message: "Business name and industry are required." }, { status: 400 });
      }

      const composedMessage = [
        `Preview request`,
        `Business name: ${businessName}`,
        `Industry: ${industry}`,
        `Color preference: ${colorPreference || "Not specified"}`,
        `Style: ${style}`,
      ].join(" | ");

      await prisma.lead.create({
        data: {
          name: businessName,
          email: "preview@vdb.digital",
          company: industry,
          message: composedMessage,
          website: null,
          source: "builder",
        },
      });

      void (async () => {
        try {
          await sendPreviewRequestAdminNotification({
            businessName,
            industry,
            colorPreference: colorPreference || "Not specified",
            style,
          });
        } catch (error) {
          logger.error("[Preview] Email sending failed", { error: String(error) });
        }
      })();

      return NextResponse.json(
        {
          success: true,
          message: "Request received. We’ll review and craft a tailored preview concept for you.",
        },
        { status: 201 }
      );
    } catch (error) {
      logger.error("[Preview] Unexpected error", { error: String(error) });
      return NextResponse.json(
        { success: false, message: "Something went wrong while submitting your request." },
        { status: 500 }
      );
    }
  },
});

