"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
  }
}

export default function LanguageWidget() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("google_translate_script")) return;

    window.googleTranslateElementInit = () => {
      // @ts-expect-error Google Translate script injects this namespace
      // eslint-disable-next-line no-new, @typescript-eslint/no-unsafe-call
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "nl",
          includedLanguages: "en,de,fr,es,it,pt",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.id = "google_translate_script";
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div
      id="google_translate_element"
      className="text-[10px] font-medium text-gray-300"
    />
  );
}

