"use client";

import { useState } from "react";

type StyleType = "Minimal" | "Luxury" | "Bold";

const sanitize = (value: string) => value.replace(/[<>]/g, "").trim();

export const PreviewBuilder = () => {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [colorPreference, setColorPreference] = useState("");
  const [style, setStyle] = useState<StyleType>("Luxury");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");
    setMessage(null);

    try {
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: sanitize(businessName),
          industry: sanitize(industry),
          colorPreference: sanitize(colorPreference),
          style,
          botField: "",
        }),
      });

      const contentType = res.headers.get("content-type") ?? "";

      let data: { success: boolean; message: string } | null = null;

      if (contentType.includes("application/json")) {
        data = (await res.json()) as { success: boolean; message: string };
      } else {
        await res.text().catch(() => null);
        throw new Error(
          "We konden je verzoek niet verwerken. Probeer het nog een keer."
        );
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Something went wrong.");
      }

      setStatus("success");
      setMessage(data.message);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "We konden je verzoek niet verwerken. Probeer het nog een keer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const primaryColor =
    style === "Bold"
      ? "from-amber-500 to-rose-500"
      : style === "Minimal"
      ? "from-slate-200 to-slate-500"
      : "from-gold to-yellow-200";

  return (
    <section className="relative py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(198,169,93,0.22),transparent_55%),radial-gradient(circle_at_bottom,_rgba(0,0,0,0.96),transparent_60%)]" />
      <div className="pointer-events-none absolute -left-40 top-10 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-gold/8 blur-3xl" />
      <div className="section-container grid gap-10 lg:grid-cols-[0.9fr,1.1fr] items-start">
        <div className="rounded-3xl border border-white/10 bg-black/80 p-6 lg:p-7 shadow-[0_26px_70px_rgba(0,0,0,0.95)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            Configuratie
          </p>
          <h2 className="mt-3 text-lg font-semibold text-white">
            Vorm het concept in drie kalme stappen.
          </h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <input
              type="text"
              name="botField"
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                Stap 01 · Fundament
              </p>
              <div className="grid gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300">
                    Bedrijfsnaam
                  </label>
                  <input
                    className="input-base mt-1"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300">
                    Sector
                  </label>
                  <input
                    className="input-base mt-1"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                Stap 02 · Esthetische richting
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300">
                    Kleurvoorkeur
                  </label>
                  <input
                    className="input-base mt-1"
                    value={colorPreference}
                    onChange={(e) => setColorPreference(e.target.value)}
                    placeholder="bijv. diep antraciet met gouden accenten"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300">
                    Stijl
                  </label>
                  <div className="mt-1 flex gap-2">
                    {(["Minimal", "Luxury", "Bold"] as StyleType[]).map(
                      (option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setStyle(option)}
                          className={`flex-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            style === option
                              ? "border-gold bg-gold/15 text-gold"
                              : "border-gray-700 bg-black/30 text-gray-300 hover:border-gold/60"
                          }`}
                        >
                          {option}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                Stap 03 · Concept aanvragen
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full"
              >
                {isSubmitting ? "Concept wordt aangevraagd..." : "Verstuur conceptaanvraag"}
              </button>
              {status === "success" && message && (
                <p className="success-text">{message}</p>
              )}
              {status === "error" && message && (
                <p className="error-text">{message}</p>
              )}
            </div>
          </form>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute -inset-10 -z-10 bg-[radial-gradient(circle_at_top,_rgba(198,169,93,0.4),transparent_55%)] opacity-60 blur-3xl" />
          <div className="mx-auto max-w-xl rounded-[1.75rem] border border-white/12 bg-gradient-to-b from-[#181818] via-black to-black/95 shadow-[0_28px_80px_rgba(0,0,0,0.95)]">
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <p className="text-[11px] text-gray-500">
                {businessName || "vdb.digital / concept"}
              </p>
              <span className="h-5 w-16 rounded-full bg-white/5" />
            </div>
            <div className="space-y-6 px-6 pb-6 pt-5">
              <div className="rounded-2xl border border-white/10 bg-black/80 p-4">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${primaryColor}`}
                />
                <div className="mt-4 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Hero-statement
                  </p>
                  <p className="text-sm font-serif text-white">
                    {businessName || "Jouw merk, opgewaardeerd."}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {industry
                      ? `${industry} · ${style} aesthetic`
                      : "Sector-agnostisch concept · luxe esthetiek"}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 text-[11px] text-gray-200 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/12 bg-black/80 p-3">
                  <p className="text-gray-400">Primaire CTA</p>
                  <p className="mt-1 text-[10px]">
                    Start project · hero & vaste navigatie.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/12 bg-black/80 p-3">
                  <p className="text-gray-400">Social proof</p>
                  <p className="mt-1 text-[10px]">
                    Reviews, metrics en case-highlights.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/12 bg-black/80 p-3">
                  <p className="text-gray-400">Flow</p>
                  <p className="mt-1 text-[10px]">
                    Begeleid scrollen richting diensten & proces.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreviewBuilder;

