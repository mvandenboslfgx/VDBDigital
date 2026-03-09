"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (website && website.trim().length > 0) {
      setLoading(false);
      return;
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined,
        },
      });

      if (signUpError) throw new Error(signUpError.message);

      await fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "signup" }),
      }).catch(() => {});

      try {
        await fetch("/api/auth/register-preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            newsletterOptIn,
            website: website || undefined,
          }),
        });
      } catch (_) {}

      setSuccess(true);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Er ging iets mis. Probeer het opnieuw.";
      const isNetworkError =
        typeof message === "string" &&
        (message === "Failed to fetch" ||
          message.toLowerCase().includes("network") ||
          message.toLowerCase().includes("load failed") ||
          message.toLowerCase().includes("networkerror"));
      setError(isNetworkError ? "Er ging iets mis. Probeer het opnieuw." : message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FB] pt-24">
        <div className="section-container">
          <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-surface p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Account aangemaakt</h1>
            <p className="mt-3 text-slate-600">
              Controleer je e-mail om je account te bevestigen. Klik op de link die we naar {email} hebben gestuurd en log daarna in.
            </p>
            <Link href="/login" className="btn-primary mt-6 inline-block">
              Naar inloggen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F7FB] pt-24">
      <div className="section-container">
        <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-surface p-8 shadow-sm">
          <Link href="/" className="inline-block">
            <Image src="/logo-vdb.png" alt="VDB Digital" width={220} height={72} className="h-16 w-auto object-contain md:h-[4.5rem]" />
          </Link>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">Account aanmaken</h2>
          <p className="mt-2 text-sm text-slate-600">
            Gratis toegang tot website-scans. Later upgraden voor meer.
          </p>
          <form onSubmit={handleSubmit} className="relative mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700">E-mail</label>
              <input
                type="email"
                className="input-light mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">Password (min 8 characters)</label>
              <input
                type="password"
                className="input-light mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-[#EEF1F5] p-3">
              <input
                type="checkbox"
                checked={newsletterOptIn}
                onChange={(e) => setNewsletterOptIn(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Ontvang updates van VDB Digital</span>
            </label>
            <div className="absolute -left-[9999px] h-px w-px overflow-hidden opacity-0" aria-hidden>
              <label htmlFor="website-hp">Website</label>
              <input
                id="website-hp"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Creating account…" : "Create account"}
            </button>
            {error && <p className="error-text text-red-600">{error}</p>}
          </form>
          <p className="mt-4 text-xs text-slate-500">
            Heb je al een account? <Link href="/login" className="text-[#B89B50] font-medium hover:text-[#C6A95D] hover:underline">Inloggen</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
