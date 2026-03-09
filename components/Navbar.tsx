"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useTranslations } from "@/components/I18nProvider";

type User = { id: string; email: string; role: string } | null;

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

const TAP_MIN = "min-h-[44px] min-w-[44px]";

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Platform",
    href: "/platform",
    children: [
      { label: "Hoe het werkt", href: "/platform/hoe-het-werkt" },
      { label: "Website analyse", href: "/platform/website-analyse" },
      { label: "AI technologie", href: "/platform/ai-technologie" },
      { label: "Rapport systeem", href: "/platform/rapport-systeem" },
      { label: "Voor agencies", href: "/platform/agencies" },
      { label: "Integraties", href: "/platform/integraties" },
    ],
  },
  {
    label: "Tools",
    href: "/tools",
    children: [
      { label: "Website analyse", href: "/tools/website-audit" },
      { label: "SEO tools", href: "/tools/seo-keyword-finder" },
      { label: "Conversie tools", href: "/tools/conversion-analyzer" },
      { label: "Performance tools", href: "/tools/performance-check" },
      { label: "Content tools", href: "/tools/content-generator" },
      { label: "Marketing tools", href: "/tools/marketing-strategy" },
    ],
  },
  {
    label: "Apparaten",
    href: "/products",
    children: [
      { label: "Android 14 Smart TV Box 8K", href: "/products/android-14-tv-box" },
      { label: "Alle producten", href: "/products" },
    ],
  },
  {
    label: "Kennisbank",
    href: "/kennisbank",
    children: [
      { label: "SEO", href: "/kennisbank/seo" },
      { label: "Website snelheid", href: "/kennisbank/website-snelheid" },
      { label: "Conversie optimalisatie", href: "/kennisbank/conversie" },
      { label: "AI marketing", href: "/kennisbank/ai-marketing" },
      { label: "Digitale strategie", href: "/kennisbank/digitale-strategie" },
      { label: "Tutorials", href: "/kennisbank" },
    ],
  },
  {
    label: "Calculators",
    href: "/calculators",
    children: [
      { label: "ROI calculator", href: "/calculators/roi" },
      { label: "Break-even", href: "/calculators/break-even" },
      { label: "Prijsverhoging", href: "/calculators/prijsverhoging" },
      { label: "Freelancer tarief", href: "/calculators/freelancer-tarief" },
      { label: "Kortingsimpact", href: "/calculators/kortingsimpact" },
      { label: "Abonnement vs eenmalig", href: "/calculators/abonnement-vs-eenmalig" },
    ],
  },
  {
    label: "Prijzen",
    href: "/prijzen",
    children: [
      { label: "Overzicht", href: "/prijzen" },
      { label: "Starter", href: "/prijzen#starter" },
      { label: "Growth", href: "/prijzen#growth" },
      { label: "Agency", href: "/contact?plan=agency" },
    ],
  },
];

export const Navbar = () => {
  const pathname = usePathname();
  const { t } = useTranslations();
  const [user, setUser] = useState<User>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data: { success?: boolean; user?: { id: string; email: string; role: string } }) => {
        if (data?.success && data?.user) {
          setUser({ id: data.user.id, email: data.user.email, role: data.user.role });
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setMounted(true));
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const clearDropdownTimeout = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
  };

  const handleDropdownEnter = (label: string) => {
    clearDropdownTimeout();
    setOpenDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => setOpenDropdown(null), 120);
  };

  const dashboardHref =
    user?.role === "admin" || user?.role === "owner" ? "/admin/control-center" : "/dashboard";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="section-container">
        <motion.nav
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-surface/90 px-4 py-3 backdrop-blur md:px-6"
        >
          <Link
            href="/"
            className={`flex items-center gap-2 rounded-lg py-1.5 pr-2 ${TAP_MIN} items-center justify-center md:min-w-0 md:min-h-0`}
            aria-label="Home"
          >
            <Image
              src="/logo-vdb.png"
              alt="VDB Digital"
              width={220}
              height={72}
              className="h-14 w-auto max-h-16 object-contain object-left md:h-16 md:max-h-[4.5rem]"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div
            className="hidden items-center gap-1 text-sm font-medium text-marketing-textSecondary md:flex"
            onMouseLeave={handleDropdownLeave}
          >
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && handleDropdownEnter(item.label)}
              >
                {item.children ? (
                  <>
                    <Link
                      href={item.href}
                      className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 transition-colors hover:text-marketing-text md:min-h-[40px] ${
                        isActive(item.href) ? "text-marketing-text" : ""
                      }`}
                      aria-expanded={openDropdown === item.label}
                      aria-haspopup="true"
                      aria-controls={`nav-menu-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                      id={`nav-trigger-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      {item.label}
                      <svg
                        className={`h-4 w-4 shrink-0 transition-transform ${openDropdown === item.label ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Link>
                    <AnimatePresence>
                      {openDropdown === item.label && (
                        <motion.div
                          id={`nav-menu-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                          role="menu"
                          aria-orientation="vertical"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-full pt-1"
                          onMouseEnter={clearDropdownTimeout}
                          onMouseLeave={handleDropdownLeave}
                        >
                          <div className="min-w-[220px] rounded-xl border border-gray-200 bg-surface py-2 shadow-md">
{item.children.map((child) => (
                                <Link
                                  key={child.label}
                                  href={child.href}
                                  role="menuitem"
                                className={`block px-4 py-2.5 text-left text-sm transition-colors hover:bg-marketing-surface hover:text-marketing-text ${
                                  isActive(child.href) ? "bg-marketing-surface/50 text-marketing-text font-medium" : "text-marketing-textSecondary"
                                }`}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`inline-flex items-center rounded-lg px-3 py-2 transition-colors hover:text-marketing-text md:min-h-[40px] ${
                      isActive(item.href) ? "text-marketing-text" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            {mounted && user && (
              <Link
                href={dashboardHref}
                className={`ml-2 inline-flex items-center rounded-lg px-3 py-2 transition-colors hover:text-marketing-text ${
                  pathname.startsWith("/admin") || pathname.startsWith("/dashboard") ? "text-blue-600 font-semibold" : ""
                }`}
              >
                {t("nav.dashboard")}
              </Link>
            )}
          </div>

          {/* Desktop CTA: Inloggen, Account maken, Winkelwagen */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/cart"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-surface px-4 py-2.5 text-sm font-medium text-marketing-text transition-colors hover:bg-slate-50 md:min-h-[40px]"
              aria-label="Winkelwagen"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Winkelwagen
            </Link>
            {mounted && !user ? (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-surface px-4 py-2.5 text-sm font-medium text-marketing-textSecondary transition-colors hover:bg-slate-50 hover:text-marketing-text md:min-h-[40px]"
                >
                  Inloggen
                </Link>
                <Link
                  href="/create-account"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:scale-[1.02] md:min-h-[40px]"
                >
                  Account maken
                </Link>
              </>
            ) : (
              <Link
                href={dashboardHref}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:scale-[1.02] md:min-h-[40px]"
              >
                {t("nav.dashboard")}
              </Link>
            )}
          </div>

          {/* Mobile: hamburger + CTA */}
          <div className="flex items-center gap-2 md:hidden">
            {mounted && !user && (
              <Link
                href="/login"
                className={`inline-flex items-center justify-center rounded-xl border border-marketing-border bg-marketing-surface px-3 py-2.5 text-sm font-medium text-marketing-textSecondary ${TAP_MIN}`}
              >
                {t("auth.login")}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className={`inline-flex flex-col items-center justify-center gap-1.5 rounded-xl p-2.5 ${TAP_MIN}`}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Menu sluiten" : "Menu openen"}
            >
              <span
                className={`h-0.5 w-5 rounded-full bg-marketing-text transition-transform ${mobileOpen ? "translate-y-1 rotate-45" : ""}`}
              />
              <span
                className={`h-0.5 w-5 rounded-full bg-marketing-text transition-opacity ${mobileOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`h-0.5 w-5 rounded-full bg-marketing-text transition-transform ${mobileOpen ? "-translate-y-1 -rotate-45" : ""}`}
              />
            </button>
          </div>
        </motion.nav>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed right-0 top-0 z-40 flex h-full w-full max-w-sm flex-col gap-0 border-l border-gray-200 bg-surface p-6 pt-24 shadow-lg md:hidden"
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-marketing-textSecondary">
                Navigatie
              </p>
              {NAV_ITEMS.map((item) => (
                <div key={item.label} className="border-b border-marketing-border/60 last:border-0">
                  {item.children ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setMobileExpanded((prev) => (prev === item.label ? null : item.label))
                        }
                        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-base font-medium text-marketing-text transition-colors hover:bg-marketing-surface ${TAP_MIN}`}
                        aria-expanded={mobileExpanded === item.label}
                      >
                        {item.label}
                        <svg
                          className={`h-5 w-5 shrink-0 transition-transform ${mobileExpanded === item.label ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <AnimatePresence>
                        {mobileExpanded === item.label && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pb-2 pl-4">
                              {item.children.map((child) => (
                                <Link
                                  key={child.label}
                                  href={child.href}
                                  onClick={() => setMobileOpen(false)}
                                  className={`block rounded-lg px-3 py-2.5 text-sm text-marketing-textSecondary transition-colors hover:bg-marketing-surface hover:text-marketing-text ${TAP_MIN}`}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center rounded-xl px-4 py-3 text-base font-medium text-marketing-text transition-colors hover:bg-marketing-surface ${TAP_MIN}`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
              {mounted && user && (
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 flex items-center rounded-xl px-4 py-3 text-base font-medium text-blue-600 transition-colors hover:bg-gray-50"
                >
                  {t("nav.dashboard")}
                </Link>
              )}
              <Link
                href="/cart"
                onClick={() => setMobileOpen(false)}
                className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-marketing-border px-4 py-3 text-base font-medium text-marketing-text"
              >
                Winkelwagen
              </Link>
              {mounted && !user ? (
                <Link
                  href="/create-account"
                  onClick={() => setMobileOpen(false)}
                  className="mt-6 flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm transition-all hover:bg-blue-700"
                >
                  Account maken
                </Link>
              ) : (
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileOpen(false)}
                  className="mt-6 flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm transition-all hover:bg-blue-700"
                >
                  {t("nav.dashboard")}
                </Link>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
