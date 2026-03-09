"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  companyName: z.string().min(1, "Bedrijfsnaam verplicht").max(200),
  totalBudget: z.coerce.number().positive("Budget moet groter dan 0 zijn"),
  cpc: z.coerce.number().positive("CPC moet groter dan 0 zijn"),
});

type FormData = z.infer<typeof formSchema>;

export function AdCampaignForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { companyName: "", totalBudget: 100, cpc: 0.5 },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const res = await fetch("/api/admin/ads/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-wrap items-end gap-4">
      {error && (
        <div className="w-full rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
      <div className="min-w-[200px]">
        <label className="block text-sm font-medium text-gray-300">Bedrijfsnaam *</label>
        <input
          {...register("companyName")}
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
          placeholder="bv. Snelle Hosting BV"
        />
        {errors.companyName && (
          <p className="mt-1 text-xs text-red-400">{errors.companyName.message}</p>
        )}
      </div>
      <div className="min-w-[100px]">
        <label className="block text-sm font-medium text-gray-300">Budget (€) *</label>
        <input
          {...register("totalBudget")}
          type="number"
          step="0.01"
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
        />
        {errors.totalBudget && (
          <p className="mt-1 text-xs text-red-400">{errors.totalBudget.message}</p>
        )}
      </div>
      <div className="min-w-[100px]">
        <label className="block text-sm font-medium text-gray-300">CPC (€) *</label>
        <input
          {...register("cpc")}
          type="number"
          step="0.01"
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
        />
        {errors.cpc && (
          <p className="mt-1 text-xs text-red-400">{errors.cpc.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
      >
        {isSubmitting ? "Bezig…" : "Campagne toevoegen"}
      </button>
    </form>
  );
}
