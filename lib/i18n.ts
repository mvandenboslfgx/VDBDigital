/**
 * Simple i18n: Dutch (nl) default, English (en), German (de).
 * Only for UI text; not for API responses, logs, or database fields.
 */

import nl from "@/locales/nl/common.json";
import en from "@/locales/en/common.json";
import de from "@/locales/de/common.json";

export type Locale = "nl" | "en" | "de";

const messages: Record<Locale, Record<string, unknown>> = { nl, en, de };

function getNested(obj: Record<string, unknown>, key: string): string | undefined {
  const parts = key.split(".");
  let current: unknown = obj;
  for (const p of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[p];
  }
  return typeof current === "string" ? current : undefined;
}

export type TFunction = (key: string) => string;

/**
 * Server or sync use: returns t(key). Prefer nl as default.
 */
export function getTranslations(locale: Locale = "nl"): TFunction {
  const dict = messages[locale] ?? messages.nl;
  const fallback = messages.nl;
  return (key: string): string => {
    const value = getNested(dict as Record<string, unknown>, key)
      ?? getNested(fallback as Record<string, unknown>, key);
    return value ?? key;
  };
}

export const defaultLocale: Locale = "nl";
