"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "@/components/I18nProvider";

const LOCALES: { code: "nl" | "en" | "de"; label: string }[] = [
  { code: "nl", label: "Nederlands" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const { locale } = useTranslations();

  async function selectLocale(code: "nl" | "en" | "de") {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: code }),
    });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 text-sm text-zinc-400">
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => selectLocale(code)}
          className={`px-2 py-1 rounded transition hover:text-white ${
            locale === code ? "text-amber-400 font-medium" : ""
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
