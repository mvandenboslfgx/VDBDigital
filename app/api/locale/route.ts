import { NextResponse } from "next/server";
import { z } from "zod";

const LOCALE_COOKIE = "NEXT_LOCALE";
const VALID_LOCALES = ["nl", "en", "de"] as const;

const schema = z.enum(VALID_LOCALES);

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body.locale);
  const locale = parsed.success ? parsed.data : "nl";

  const res = NextResponse.json({ success: true, locale });
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

export async function GET() {
  return NextResponse.json({ locale: "nl" });
}
