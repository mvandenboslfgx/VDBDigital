import Link from "next/link";
import Image from "next/image";
import { COMPANY_EMAIL, COMPANY_EMAIL_MAILTO, LINKEDIN_URL, INSTAGRAM_URL } from "@/lib/company";

export default function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-surface py-16">
      <div className="section-container flex flex-col gap-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-4">
          <Link href="/" className="inline-block">
            <Image
              src="/logo-vdb.png"
              alt="VDB Digital"
              width={220}
              height={72}
              className="h-16 w-auto object-contain md:h-[4.5rem]"
            />
          </Link>
          <p className="max-w-xs text-sm text-slate-600">
            AI website audits en conversie optimalisatie.
          </p>
          <a
            href={COMPANY_EMAIL_MAILTO}
            className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors block mt-2"
          >
            {COMPANY_EMAIL}
          </a>
        </div>
        <div className="flex flex-wrap gap-12 text-sm">
          <div className="space-y-3">
            <p className="font-semibold text-slate-900">Links</p>
            <nav className="space-y-2 text-slate-600">
              <Link href="/website-scan" className="block hover:text-slate-900 transition-colors">Website scan</Link>
              <Link href="/prijzen" className="block hover:text-slate-900 transition-colors">Prijzen</Link>
              <Link href="/kennisbank" className="block hover:text-slate-900 transition-colors">Kennisbank</Link>
              <Link href="/tools" className="block hover:text-slate-900 transition-colors">Tools</Link>
              <Link href="/contact" className="block hover:text-slate-900 transition-colors">Contact</Link>
            </nav>
          </div>
          <div className="space-y-3">
            <p className="font-semibold text-slate-900">Juridisch</p>
            <nav className="space-y-2 text-slate-600">
              <Link href="/privacy" className="block hover:text-slate-900 transition-colors">Privacybeleid</Link>
              <Link href="/voorwaarden" className="block hover:text-slate-900 transition-colors">Algemene voorwaarden</Link>
              <Link href="/cookies" className="block hover:text-slate-900 transition-colors">Cookiebeleid</Link>
            </nav>
          </div>
          <div className="space-y-3">
            <p className="font-semibold text-slate-900">Social</p>
            <div className="flex gap-3 text-slate-600">
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-surface text-slate-700 text-xs transition-all hover:border-blue-300 hover:text-blue-600 hover:scale-105"
                aria-label="VDB Digital op LinkedIn"
              >
                in
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-surface text-slate-700 text-xs transition-all hover:border-blue-300 hover:text-blue-600 hover:scale-105"
                aria-label="VDB Digital op Instagram"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="section-container mt-12 pt-8 border-t border-gray-200">
        <p className="text-xs text-slate-500">
          © 2026 VDB Digital
        </p>
      </div>
    </footer>
  );
}
