import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminPath, isOwnerPath } from "@/lib/permissions";

const SAFE_NEXT = /^\/(?!\/)[\w\-\/.]*$/;
const VALID_LOCALES = ["nl", "en", "de"] as const;
type Locale = (typeof VALID_LOCALES)[number];

function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return "nl";
  const parts = header.split(",").map((p) => p.split(";")[0].trim().toLowerCase());
  for (const p of parts) {
    const lang = p.slice(0, 2);
    if (VALID_LOCALES.includes(lang as Locale)) return lang as Locale;
  }
  return "nl";
}

function safeNext(path: string): string | null {
  const t = path.trim();
  return t && SAFE_NEXT.test(t) ? t : null;
}

const PROTECTED_PREFIXES = ["/dashboard", "/portal", "/admin"];

function isProtectedPath(path: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

/** Fetch current user role from API (role lives in DB; middleware runs on Edge). */
async function getRoleFromApi(request: NextRequest): Promise<string | null> {
  try {
    const origin = request.nextUrl.origin;
    const cookie = request.headers.get("cookie") ?? "";
    const res = await fetch(`${origin}/api/auth/me`, {
      headers: { cookie },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { user?: { role?: string } };
    return data?.user?.role ?? null;
  } catch {
    return null;
  }
}

const CANONICAL_HOST = "www.vdbdigital.nl";

export async function middleware(request: NextRequest) {
  const host = request.nextUrl.hostname.toLowerCase();
  if (host === "vdbdigital.nl") {
    const canonical = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${CANONICAL_HOST}`);
    return NextResponse.redirect(canonical, 301);
  }

  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  if (!user && isProtectedPath(path)) {
    const login = new URL("/login", request.url);
    const nextParam = request.nextUrl.searchParams.get("next");
    const allowed = safeNext(nextParam ?? path);
    if (allowed) login.searchParams.set("next", allowed);
    return NextResponse.redirect(login);
  }

  if (user && isAdminPath(path)) {
    const role = await getRoleFromApi(request);
    // Owner-only routes: only owner may access
    if (isOwnerPath(path)) {
      if (role !== "owner") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } else if (role !== "admin" && role !== "owner") {
      // Other admin routes: admin or owner may access
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Automatic language: set NEXT_LOCALE from Accept-Language if not already set
  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (!localeCookie || !VALID_LOCALES.includes(localeCookie as Locale)) {
    const locale = localeFromAcceptLanguage(request.headers.get("accept-language"));
    response.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
