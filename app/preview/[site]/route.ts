import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

const ALLOWED_SITES: Record<string, string> = {
  "de-elektricien": "https://de-elektricien.nl",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ site: string }> }
) {
  const { site } = await params;
  const targetUrl = ALLOWED_SITES[site];

  if (!targetUrl) {
    return NextResponse.json({ error: "Unknown preview site" }, { status: 404 });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; VDBDigital-Preview/1.0; +https://vdb.digital)",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return new NextResponse(
        `<!DOCTYPE html><html><body><p>Preview kon niet worden geladen (${res.status}).</p></body></html>`,
        {
          status: 502,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    let html = await res.text();

    const baseHref = targetUrl.endsWith("/") ? targetUrl : targetUrl + "/";
    const baseTag = `<base href="${baseHref}" />`;

    html = html.replace(
      /<meta[^>]*Content-Security-Policy[^>]*\/?>/gi,
      ""
    );

    const origin = baseHref.replace(/\/$/, "");
    html = html.replace(
      /(href|src)=["'](\/(?!\/)[^"']*)["']/g,
      (_, attr, path) => `${attr}="${origin}${path}"`
    );

    const headMatch = html.match(/<head[^>]*>/i);
    if (headMatch) {
      html = html.replace(headMatch[0], `${headMatch[0]}${baseTag}`);
    } else {
      const htmlMatch = html.match(/<html[^>]*>/i);
      if (htmlMatch) {
        html = html.replace(htmlMatch[0], `${htmlMatch[0]}<head>${baseTag}</head>`);
      } else {
        html = `<!DOCTYPE html><html><head>${baseTag}</head><body>${html}</body></html>`;
      }
    }

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch (error) {
    logger.error("[Preview/Site] Fetch error", { error: String(error), site });
    return new NextResponse(
      `<!DOCTYPE html><html><body><p>Preview kon niet worden geladen. Probeer later opnieuw.</p></body></html>`,
      {
        status: 502,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }
}
