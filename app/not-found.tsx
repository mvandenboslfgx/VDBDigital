import Link from "next/link";
import SiteShell from "@/components/SiteShell";

/**
 * Root not-found (404) page. Shown when a route does not exist.
 */
export default function NotFound() {
  return (
    <SiteShell>
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Pagina niet gevonden</h1>
          <p className="mt-2 text-slate-600">
            De pagina die je zoekt bestaat niet of is verplaatst.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-goldHover"
          >
            Naar home
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
