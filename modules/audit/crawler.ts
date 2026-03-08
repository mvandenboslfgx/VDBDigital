/**
 * Layer 1: Data collection. Fetch HTML, parse DOM, return structured signals.
 * No AI. Deterministic: same HTML → same signals.
 */

import * as cheerio from "cheerio";
import type { CrawlSignals, CrawlResult } from "./types";

const DEFAULT_TIMEOUT_MS = 15_000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function normalizeUrl(raw: string): string {
  let url = raw.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url;
}

function isInternal(href: string, baseUrl: string): boolean {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  try {
    const base = new URL(baseUrl);
    const full = href.startsWith("http") ? new URL(href) : new URL(href, base.origin);
    return full.origin === base.origin;
  } catch {
    return false;
  }
}

const CTA_PATTERN = /contact|aanmelden|offerte|bestel|koop|start|gratis|demo|probeer|inschrijven|subscribe|buy|order|get started|learn more/i;

export async function collectSignals(
  rawUrl: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<CrawlResult> {
  let url: string;
  try {
    url = normalizeUrl(rawUrl);
    new URL(url);
  } catch {
    return {
      success: false as const,
      error: "INVALID_URL" as const,
      message: "Ongeldige URL. Gebruik bijvoorbeeld https://voorbeeld.nl",
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        return { success: false as const, error: "BLOCKED" as const, message: "De website blokkeert het ophalen van de pagina." };
      }
      if (response.status >= 500) {
        return { success: false, error: "FETCH_ERROR", message: `De website gaf een fout (${response.status}). Probeer het later opnieuw.` };
      }
      return {
        success: false as const,
        error: "FETCH_ERROR" as const,
        message: `Website gaf status ${response.status}. Controleer de URL.`,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $("title").first().text().trim();
    const metaDesc = $('meta[name="description"]').attr("content")?.trim() ?? "";
    const h1Count = $("h1").length;
    const h2Count = $("h2").length;
    const h1Text = $("h1").first().text().trim();
    const headingCount = $("h1, h2, h3, h4, h5, h6").length;

    const allImages = $("img");
    const imageCount = allImages.length;
    let imagesWithoutAlt = 0;
    allImages.each((_, el) => {
      const alt = $(el).attr("alt");
      if (alt === undefined || alt.trim() === "") imagesWithoutAlt += 1;
    });

    const links = $("a[href]");
    let internalLinks = 0;
    let externalLinks = 0;
    let ctaCount = 0;
    links.each((_, el) => {
      const href = $(el).attr("href") ?? "";
      const text = $(el).text() + " " + href;
      if (isInternal(href, url)) internalLinks += 1;
      else if (href.startsWith("http")) externalLinks += 1;
      if (CTA_PATTERN.test(text)) ctaCount += 1;
    });

    const canonicalTag = !!$('link[rel="canonical"]').attr("href")?.trim();
    const robotsMeta = $('meta[name="robots"]').attr("content")?.trim() ?? null;
    const viewportMeta = !!$('meta[name="viewport"]').attr("content")?.trim();
    const structuredData = $('script[type="application/ld+json"]').length > 0;

    const formCount = $("form").length;
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

    const signals: CrawlSignals = {
      url,
      title: title.slice(0, 300),
      metaDescription: metaDesc.slice(0, 600),
      h1Count,
      h2Count,
      imageCount,
      imagesWithoutAlt,
      internalLinks,
      externalLinks,
      canonicalTag,
      robotsMeta,
      viewportMeta,
      structuredData,
      formCount,
      ctaCount,
      wordCount,
      h1Text: h1Text.slice(0, 200),
      headingCount,
    };

    return { success: true, signals };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        return { success: false, error: "TIMEOUT", message: "De website reageerde niet op tijd. Probeer het later of een andere URL." };
      }
    }
    return {
      success: false as const,
      error: "FETCH_ERROR" as const,
      message: "Kon de website niet bereiken. Controleer de URL of probeer het later opnieuw.",
    };
  }
}
