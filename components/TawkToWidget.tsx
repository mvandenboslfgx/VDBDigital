"use client";

import Script from "next/script";

const TAWK_PROPERTY_ID = "69ae11eeddd7fc1c3485300b";
const TAWK_WIDGET_ID = "1jj7vc302";
const TAWK_SCRIPT_URL = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;

/**
 * Tawk.to chat widget – bubble rechtsonder op elke pagina.
 * Stel welkomstbericht in via Tawk Dashboard → Chat Widget.
 * Kleur: gebruik #2563EB (primary) in Tawk Dashboard zodat de chat matcht met de site.
 * Zie je de bubble niet? Controleer: Tawk Dashboard → Widget visibility aan;
 * adblocker uitzetten; browserconsole op CSP/scriptfouten.
 */
export function TawkToWidget() {
  return (
    <Script
      id="tawk-to"
      src={TAWK_SCRIPT_URL}
      strategy="afterInteractive"
    />
  );
}
