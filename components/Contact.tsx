"use client";

import { useState, useEffect } from "react";
import { COMPANY_EMAIL, COMPANY_EMAIL_MAILTO, LINKEDIN_URL, INSTAGRAM_URL } from "@/lib/company";

const sanitize = (value: string) => value.replace(/[<>]/g, "").trim();

function getUtmParams(): { utmSource?: string; utmMedium?: string; utmCampaign?: string } {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    utmSource: p.get("utm_source") ?? undefined,
    utmMedium: p.get("utm_medium") ?? undefined,
    utmCampaign: p.get("utm_campaign") ?? undefined,
  };
}

export const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [botField, setBotField] = useState("");
  const [website, setWebsite] = useState("");
  const [utm, setUtm] = useState<ReturnType<typeof getUtmParams>>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setUtm(getUtmParams());
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus("idle");
    setFeedback(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sanitize(name),
          email: sanitize(email),
          company: sanitize(company),
          message: sanitize(message),
          botField,
          website: website || undefined,
          ...utm,
        }),
      });

      const data = (await res.json()) as { success: boolean; message: string };

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Something went wrong.");
      }

      setStatus("success");
      setFeedback(data.message);
      setName("");
      setEmail("");
      setCompany("");
      setMessage("");
      setBotField("");
      setWebsite("");
    } catch (error) {
      setStatus("error");
      setFeedback(
        error instanceof Error
          ? error.message
          : "We konden je bericht niet verzenden. Probeer het nog een keer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-32">
      <div className="section-container grid gap-12 lg:grid-cols-[1.2fr,1fr] items-start">
        <div>
          <p className="section-heading">Contact</p>
          <h2 className="section-title">
            Vertel ons over het project dat je niet kunt verprutsen.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-300 max-w-xl">
            Deel de essentie. Wij analyseren, rekenen door en komen terug met
            een scherp voorstel—timing, investering en rollout-plan.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Direct e-mailen?{" "}
            <a href={COMPANY_EMAIL_MAILTO} className="text-gold hover:underline">
              {COMPANY_EMAIL}
            </a>
            {" · "}
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              LinkedIn
            </a>
            {" · "}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              Instagram
            </a>
          </p>
          <form onSubmit={handleSubmit} className="relative mt-8 space-y-4">
            <input
              type="text"
              name="botField"
              value={botField}
              onChange={(e) => setBotField(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />
            <div
              className="absolute h-px w-px overflow-hidden opacity-0"
              style={{ position: "absolute", left: "-9999px" }}
              aria-hidden="true"
            >
              <label htmlFor="contact-website-hp">Website</label>
              <input
                id="contact-website-hp"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-300">
                  Naam
                </label>
                <input
                  className="input-base mt-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  className="input-base mt-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300">
                Bedrijf
              </label>
              <input
                className="input-base mt-1"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Optioneel"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300">
                Projectdetails
              </label>
              <textarea
                className="input-base mt-1 min-h-[140px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <p className="mt-1 text-[11px] text-gray-500">
                Wat hoop je dat deze nieuwe website oplevert? Zijn er belangrijke
                lanceringsdata of randvoorwaarden?
              </p>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full sm:w-auto"
            >
              {submitting ? "Details worden verzonden..." : "Verstuur projectdetails"}
            </button>
            {status === "success" && feedback && (
              <p className="success-text">{feedback}</p>
            )}
            {status === "error" && feedback && (
              <p className="error-text">{feedback}</p>
            )}
          </form>
        </div>
        <div className="glass-panel border-white/10 bg-gradient-to-br from-white/5 via-black to-black/95 p-6 shadow-[0_24px_55px_rgba(0,0,0,0.95)]">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-400">
            Traject in één oogopslag
          </p>
          <div className="mt-5 space-y-4 text-sm text-gray-200">
            <div className="flex items-center justify-between rounded-2xl bg-black/40 px-4 py-3 border border-white/5">
              <span>Typisch traject</span>
              <span className="text-xs text-gray-400">
                4–6 weken · 3 fasen
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl bg-black/40 p-3 border border-white/5">
                <p className="text-gray-400">Phase 01</p>
                <p className="mt-1 text-gray-200">Positionering & structuur</p>
              </div>
              <div className="rounded-2xl bg-black/40 p-3 border border-white/5">
                <p className="text-gray-400">Phase 02</p>
                <p className="mt-1 text-gray-200">Interface & interacties</p>
              </div>
              <div className="rounded-2xl bg-black/40 p-3 border border-white/5">
                <p className="text-gray-400">Phase 03</p>
                <p className="mt-1 text-gray-200">
                  Implementatie & performance
                </p>
              </div>
              <div className="rounded-2xl bg-black/40 p-3 border border-white/5">
                <p className="text-gray-400">Nazorg</p>
                <p className="mt-1 text-gray-200">
                  Launch-ondersteuning & optimalisatie
                </p>
              </div>
            </div>
            <p className="text-[11px] text-gray-500">
              Elk traject wordt beperkt tot een klein aantal gelijktijdige
              klanten, zodat er altijd senior aandacht op elk project zit.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

