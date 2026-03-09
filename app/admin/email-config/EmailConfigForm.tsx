"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formSchema = z.object({
  sourceEmail: z.string().min(1, "E-mailadres verplicht").max(254).refine((v) => EMAIL_REGEX.test(v), "Ongeldig e-mailadres"),
  targetEmail: z.string().min(1, "Doel e-mailadres verplicht").max(254).refine((v) => EMAIL_REGEX.test(v), "Ongeldig doel e-mailadres"),
});

type FormData = z.infer<typeof formSchema>;

export function EmailConfigForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { sourceEmail: "", targetEmail: "" },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const res = await fetch("/api/admin/email-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceEmail: data.sourceEmail.trim().toLowerCase(),
          targetEmail: data.targetEmail.trim().toLowerCase(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Toevoegen mislukt");
        return;
      }
      reset();
      router.refresh();
    } catch {
      setError("Toevoegen mislukt");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-wrap items-end gap-4">
      {error && (
        <div className="w-full rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-300">{error}</div>
      )}
      <div className="min-w-[200px]">
        <label className="block text-xs font-medium text-gray-400">E-mailadres</label>
        <input
          {...register("sourceEmail")}
          type="email"
          placeholder="bv. security@vdbdigital.nl"
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
        />
        {errors.sourceEmail && (
          <p className="mt-1 text-xs text-red-400">{errors.sourceEmail.message}</p>
        )}
      </div>
      <div className="min-w-[200px]">
        <label className="block text-xs font-medium text-gray-400">Doel e-mailadres</label>
        <input
          {...register("targetEmail")}
          type="email"
          placeholder="bv. verzamelvdbdigital@gmail.com"
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
        />
        {errors.targetEmail && (
          <p className="mt-1 text-xs text-red-400">{errors.targetEmail.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-50"
        title="Toevoegen"
        aria-label="Configuratie toevoegen"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </form>
  );
}
