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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="section-container">
          <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-black/80 p-8 text-center">
            <h1 className="text-2xl font-serif text-white">Check your email</h1>
            <p className="mt-3 text-gray-400">Als er een account bij dit e-mailadres hoort, ontvang je een link om je wachtwoord te resetten.</p>
            <Link href="/login" className="mt-6 inline-block btn-primary">Back to sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="section-container">
        <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-black/80 p-8">
          <h1 className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-400">VDB Digital</h1>
          <h2 className="mt-3 text-2xl font-serif text-white">Reset password</h2>
          <p className="mt-2 text-sm text-gray-400">Enter your email and we’ll send you a reset link.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300">Email</label>
              <input type="email" className="input-base mt-1" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Sending..." : "Send reset link"}
            </button>
            {error && <p className="error-text">{error}</p>}
          </form>
          <p className="mt-4 text-sm">
            <Link href="/login" className="text-gold hover:underline">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
