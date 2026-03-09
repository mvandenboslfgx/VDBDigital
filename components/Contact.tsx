"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { COMPANY_EMAIL, COMPANY_EMAIL_MAILTO, LINKEDIN_URL, INSTAGRAM_URL } from "@/lib/company";
import { SuccessCheck } from "@/components/ui/SuccessCheck";

const contactSchema = z.object({
  name: z.string().min(1, "Naam is verplicht").max(200),
  email: z.string().email("Ongeldig e-mailadres"),
  company: z.string().max(200).optional(),
  message: z.string().min(10, "Bericht moet minimaal 10 tekens zijn").max(5000),
  botField: z.string().max(0).optional(),
  website: z.string().max(500).optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

function getUtmParams(): { utmSource?: string; utmMedium?: string; utmCampaign?: string } {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    utmSource: p.get("utm_source") ?? undefined,
    utmMedium: p.get("utm_medium") ?? undefined,
    utmCampaign: p.get("utm_campaign") ?? undefined,
  };
}

const sanitize = (value: string) => value.replace(/[<>]/g, "").trim();

export const Contact = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", company: "", message: "", botField: "", website: "" },
  });

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  const onSubmit = async (data: ContactFormData) => {
    setStatus("idle");
    setFeedback(null);
    clearErrors();
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sanitize(data.name),
          email: sanitize(data.email),
          company: data.company ? sanitize(data.company) : "",
          message: sanitize(data.message),
          botField: data.botField,
          website: data.website || undefined,
          ...getUtmParams(),
        }),
      });
      const result = (await res.json()) as { success: boolean; message: string };
      if (!res.ok || !result.success) throw new Error(result.message ?? "Verzenden mislukt");
      setStatus("success");
      setFeedback(result.message);
      reset();
    } catch (err) {
      setStatus("error");
      setFeedback(err instanceof Error ? err.message : "We konden je bericht niet verzenden. Probeer het nog een keer.");
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
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-8"
              >
                <SuccessCheck size={56} />
                <p className="text-center text-emerald-400">{feedback}</p>
              </motion.div>
            ) : (
              <form key="form" onSubmit={handleSubmit(onSubmit)} className="relative mt-8 space-y-4">
                <input type="text" {...register("botField")} className="hidden" tabIndex={-1} autoComplete="off" />
                <div className="absolute -left-[9999px] h-px w-px overflow-hidden opacity-0" aria-hidden>
                  <label htmlFor="contact-website-hp">Website</label>
                  <input id="contact-website-hp" type="text" {...register("website")} tabIndex={-1} autoComplete="off" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-300">Naam</label>
                    <input
                      className={"input-base mt-1 " + (errors.name ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "")}
                      {...register("name")}
                      placeholder="Je naam"
                    />
                    {errors.name && <p className="mt-1.5 text-sm text-red-400">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-300">Email</label>
                    <input
                      type="email"
                      className={"input-base mt-1 " + (errors.email ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "")}
                      {...register("email")}
                      placeholder="email@voorbeeld.nl"
                    />
                    {errors.email && <p className="mt-1.5 text-sm text-red-400">{errors.email.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-300">Bedrijf</label>
                  <input className="input-base mt-1" {...register("company")} placeholder="Optioneel" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-300">Projectdetails</label>
                  <textarea
                    className={"input-base mt-1 min-h-[140px] " + (errors.message ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "")}
                    {...register("message")}
                    placeholder="Vertel over je project..."
                  />
                  {errors.message && <p className="mt-1.5 text-sm text-red-400">{errors.message.message}</p>}
                  <p className="mt-1 text-[11px] text-gray-500">
                    Wat hoop je dat deze nieuwe website oplevert? Zijn er belangrijke lanceringsdata of randvoorwaarden?
                  </p>
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto">
                  {isSubmitting ? "Details worden verzonden..." : "Verstuur projectdetails"}
                </button>
                {status === "error" && feedback && <p className="error-text">{feedback}</p>}
              </form>
            )}
          </AnimatePresence>
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

