"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Root error boundary. Catches unhandled errors in the app and shows a safe, user-friendly message.
 * Logs the real error to console so you can debug (F12 → Console). In dev, shows the message.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    console.error("[Error boundary]", error?.message, error?.digest, error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-surface p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Er is iets misgegaan</h1>
        <p className="mt-2 text-slate-600">
          We hebben een fout gemeld. Probeer de pagina te vernieuwen of ga terug naar de startpagina.
        </p>
        {isDev && error?.message && (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-left text-xs text-amber-900 font-mono">
            {error.message}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-goldHover"
          >
            Opnieuw proberen
          </button>
          <Link
            href="/"
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Naar home
          </Link>
        </div>
      </div>
    </div>
  );
}
