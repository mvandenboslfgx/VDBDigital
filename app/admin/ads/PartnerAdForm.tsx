"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  title: z.string().min(1, "Titel verplicht").max(200),
  description: z.string().min(1, "Omschrijving verplicht").max(2000),
  ctaText: z.string().max(100).default("Bekijk aanbieding"),
  url: z.string().url("Ongeldige URL").max(500),
  image: z.string().url().optional().or(z.literal("")),
  targetMetric: z.enum(["SEO", "PERF", "UX", "CONV"]),
  campaignId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

type Campaign = { id: string; companyName: string };

export function PartnerAdForm({ campaigns = [] }: { campaigns?: Campaign[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      ctaText: "Bekijk aanbieding",
      url: "",
      image: "",
      targetMetric: "PERF",
      campaignId: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          image: data.image?.trim() || undefined,
          campaignId: data.campaignId?.trim() || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Opslaan mislukt");
        return;
      }
      reset();
      router.refresh();
    } catch {
      setError("Opslaan mislukt");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
      {error && (
        <div className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-300">Titel *</label>
        <input
          {...register("title")}
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
          placeholder="bv. Snelle hosting voor betere scores"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">URL (partnerlink) *</label>
        <input
          {...register("url")}
          type="url"
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
          placeholder="https://..."
        />
        {errors.url && (
          <p className="mt-1 text-xs text-red-400">{errors.url.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">CTA-tekst</label>
        <input
          {...register("ctaText")}
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
          placeholder="Bekijk aanbieding"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Afbeelding (URL)</label>
        <input
          {...register("image")}
          type="url"
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Campagne (optioneel)</label>
        <select
          {...register("campaignId")}
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
        >
          <option value="">Geen campagne</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.companyName}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Target Metric *</label>
        <select
          {...register("targetMetric")}
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
        >
          <option value="SEO">SEO</option>
          <option value="PERF">Performance (Perf)</option>
          <option value="UX">UX</option>
          <option value="CONV">Conversion (Conv)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Omschrijving *</label>
        <textarea
          {...register("description")}
          rows={3}
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
          placeholder="Korte omschrijving van het aanbod..."
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
      >
        {isSubmitting ? "Bezig…" : "Advertentie toevoegen"}
      </button>
    </form>
  );
}
