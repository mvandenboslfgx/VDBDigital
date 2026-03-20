import { NextResponse } from "next/server";
import { z } from "zod";
import { createSecureRoute } from "@/lib/secureRoute";

const LOCALE_COOKIE = "NEXT_LOCALE";
const VALID_LOCALES = ["nl", "en", "de"] as const;

const localeInputBodySchema = z
  .object({
    locale: z.string().optional(),
  })
  .strict();

export const POST = createSecureRoute<z.infer<typeof localeInputBodySchema>, undefined>({
  auth: "optional",
  csrf: true,
  rateLimit: "api",
  bodyMode: "json",
  schema: localeInputBodySchema,
  invalidInputMessage: "Ongeldige aanvraag.",
  logContext: "Locale/POST",
  handler: async ({ input }) => {
    const locale =
      input.locale && (VALID_LOCALES as readonly string[]).includes(input.locale) ? input.locale : "nl";

    const res = NextResponse.json({ success: true, locale });
    res.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  },
});

export const GET = createSecureRoute<undefined>({
  auth: "optional",
  csrf: false,
  rateLimit: "api",
  bodyMode: "none",
  logContext: "Locale/GET",
  handler: async () => {
    return NextResponse.json({ locale: "nl" });
  },
});
