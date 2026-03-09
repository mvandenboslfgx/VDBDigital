"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "@/components/I18nProvider";

function getSafeRedirect(next: string | null): string {
  if (!next || typeof next !== "string") return "/dashboard";
  const t = next.trim();
  if (!t || !/^\/(?!\/)[\w\-\/.]*$/.test(t)) return "/dashboard";
  return t;
}

function LoginForm() {
  const { t } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const lockRes = await fetch("/api/auth/check-lockout");
      if (lockRes.status === 429) {
        setError(t("auth.loginErrorLockout"));
        setLoading(false);
        return;
      }
      const normalizedEmail = email.trim().toLowerCase();
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (signInError) {
        try {
          await fetch("/api/auth/login-failed", { method: "POST" });
        } catch {
          // ignore
        }
        const m = signInError.message ?? "";
        const msg =
          m === "Invalid login credentials" || m.toLowerCase().includes("invalid login")
            ? t("auth.invalidCredentials")
            : m === "Email not confirmed" || m.toLowerCase().includes("email not confirmed")
              ? "Bevestig eerst uw e-mailadres via de link in uw inbox."
              : m
                ? `${t("auth.loginErrorGeneric")} (${m})`
                : t("auth.loginErrorGeneric");
        setError(msg);
        setLoading(false);
        return;
      }
      if (data.user) {
        // Wacht tot Supabase de sessie-cookie heeft gezet; server moet die kunnen lezen
        await new Promise((r) => setTimeout(r, 600));
        let meData: { success?: boolean; user?: { role?: string } } = {};
        for (let attempt = 0; attempt < 3; attempt++) {
          const meRes = await fetch("/api/auth/me", { credentials: "include" });
          meData = (await meRes.json()) as { success?: boolean; user?: { role?: string } };
          if (meRes.ok && meData?.success) break;
          await new Promise((r) => setTimeout(r, 400));
        }
        const role = meData?.user?.role ?? "lead";
        const next = searchParams.get("next");
        const target = role === "admin" || role === "owner" ? "/admin" : getSafeRedirect(next);
        // Bij 401 na inloggen: hard redirect zodat cookie bij volgende request wél meegaat (domein/cookie-sync)
        if (!meData?.success && (typeof window !== "undefined")) {
          window.location.href = target;
          return;
        }
        router.push(target);
        router.refresh();
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      setError(detail ? `${t("auth.loginErrorGeneric")} (${detail})` : t("auth.loginErrorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background pt-24">
      <div className="section-container">
        <div className="mx-auto max-w-md rounded-2xl border border-white/[0.06] bg-[#111113] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.95)]">
          <Link href="/" className="inline-block">
            <Image
              src="/logo-vdb.png"
              alt="VDB Digital"
              width={220}
              height={72}
              className="h-16 w-auto object-contain brightness-105 contrast-105 md:h-[4.5rem]"
            />
          </Link>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-white">
            {t("auth.login")}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            {t("auth.loginSubtitle")}
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300">{t("auth.emailLabel")}</label>
              <input
                type="email"
                className="input-base mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300">{t("auth.passwordLabel")}</label>
              <input
                type="password"
                className="input-base mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? t("auth.loggingIn") : t("auth.login")}
            </button>
            {error && <p className="error-text">{error}</p>}
          </form>
          <p className="mt-4 text-sm text-gray-400">
            <Link href="/reset-password" className="text-gold hover:underline">
              {t("auth.forgotPassword")}
            </Link>
          </p>
          <p className="mt-2 text-xs text-gray-500">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="text-gold hover:underline">
              {t("auth.createAccount")}
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background pt-24">
        <div className="section-container">
          <div className="mx-auto max-w-md rounded-2xl border border-white/[0.06] bg-[#111113] p-8 animate-pulse">
            <div className="h-8 w-24 bg-white/10 rounded" />
            <div className="mt-6 h-8 bg-white/10 rounded w-3/4" />
            <div className="mt-4 h-4 bg-white/10 rounded w-full" />
            <div className="mt-6 h-12 bg-white/10 rounded w-full" />
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
