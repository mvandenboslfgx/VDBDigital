"use client";

import { createContext, useContext, useMemo } from "react";
import { getTranslations, type Locale, type TFunction } from "@/lib/i18n";

const I18nContext = createContext<{ t: TFunction; locale: Locale } | null>(null);

export function I18nProvider({
  children,
  locale = "nl",
}: {
  children: React.ReactNode;
  locale?: Locale;
}) {
  const value = useMemo(() => ({ t: getTranslations(locale), locale }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslations(): { t: TFunction; locale: Locale } {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return { t: getTranslations("nl"), locale: "nl" };
  }
  return ctx;
}
