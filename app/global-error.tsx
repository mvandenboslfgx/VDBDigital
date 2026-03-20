"use client";

/**
 * Root global error boundary. Catches errors that escape the tree (including in root layout).
 * Renders a minimal fallback so the app never shows a blank crash.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <h1 className="text-xl font-semibold text-slate-900">Er is iets misgegaan</h1>
          <p className="mt-2 text-slate-600 text-sm">
            Een onverwachte fout is opgetreden. Probeer de pagina te vernieuwen.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Opnieuw proberen
            </button>
            <a
              href="/"
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Naar home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
