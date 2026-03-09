"use client";

import Link from "next/link";

/**
 * Root error boundary. Catches unhandled errors in the app and shows a safe, user-friendly message.
 * In production no stack or internal details are exposed.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-surface p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Er is iets misgegaan</h1>
        <p className="mt-2 text-slate-600">
          We hebben een fout gemeld. Probeer de pagina te vernieuwen of ga terug naar de startpagina.
        </p>
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
