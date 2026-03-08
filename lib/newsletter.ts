import * as jose from "jose";
import { env } from "./env";

const UNSUB_EXPIRY = "30d";

export async function getUnsubscribeUrl(email: string): Promise<string> {
  const base =
    process.env.SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const token = await getUnsubscribeToken(email);
  return `${base}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}

export async function getUnsubscribeToken(email: string): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  return new jose.SignJWT({ email: email.toLowerCase() })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(UNSUB_EXPIRY)
    .sign(secret);
}

export async function verifyUnsubscribeToken(
  token: string
): Promise<{ email: string } | null> {
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const email = payload.email as string;
    return email ? { email: email.toLowerCase() } : null;
  } catch {
    return null;
  }
}
