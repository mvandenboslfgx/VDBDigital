"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${origin}/login`,
      });
      if (resetError) throw new Error(resetError.message);
      setSent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Er ging iets mis.";
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

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB]">
        <div className="section-container">
          <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-surface p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">Check je e-mail</h1>
            <p className="mt-3 text-slate-600">Als er een account bij dit e-mailadres hoort, ontvang je een link om je wachtwoord te resetten.</p>
            <Link href="/login" className="mt-6 inline-block btn-primary">Terug naar inloggen</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB]">
      <div className="section-container">
        <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-surface p-8 shadow-sm">
          <h1 className="text-xs font-semibold tracking-[0.25em] uppercase text-slate-500">VDB Digital</h1>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Wachtwoord resetten</h2>
          <p className="mt-2 text-sm text-slate-600">Vul je e-mail in en we sturen je een resetlink.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700">E-mail</label>
              <input type="email" className="input-light mt-1" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Bezig..." : "Stuur resetlink"}
            </button>
            {error && <p className="error-text text-red-600">{error}</p>}
          </form>
          <p className="mt-4 text-sm text-slate-600">
            <Link href="/login" className="text-[#B89B50] font-medium hover:text-[#C6A95D] hover:underline">Terug naar inloggen</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
