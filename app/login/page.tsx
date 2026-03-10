"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "@/components/I18nProvider";
import { getSafeRedirectUrl } from "@/lib/safeRedirect";

function LoginForm() {
  const { t } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
        },
      });
      if (oauthError) {
        setError(oauthError.message);
        setLoading(false);
        return;
      }
      if (data?.url) window.location.href = data.url;
    } catch {
      setError(t("auth.loginErrorGeneric"));
    } finally {
      setLoading(false);
    }
  };

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
        const msg =
          signInError.message === "Invalid login credentials"
            ? t("auth.invalidCredentials")
            : signInError.message === "Email not confirmed"
              ? "Bevestig eerst uw e-mailadres via de link in uw inbox."
              : t("auth.loginErrorGeneric");
        setError(msg);
        setLoading(false);
        return;
      }
      if (data.user) {
        // Korte pauze zodat Supabase de sessie-cookie kan zetten voordat de server deze leest
        await new Promise((r) => setTimeout(r, 200));
        let meData: { success?: boolean; user?: { role?: string } } = {};
        for (let attempt = 0; attempt < 2; attempt++) {
          const meRes = await fetch("/api/auth/me");
          meData = (await meRes.json()) as { success?: boolean; user?: { role?: string } };
          if (meRes.ok && meData?.success) break;
          if (attempt === 0) await new Promise((r) => setTimeout(r, 300));
        }
        const role = meData?.user?.role ?? "lead";
        const next = searchParams.get("next");
        const target = role === "admin" || role === "owner" ? "/admin" : getSafeRedirectUrl(next, "/dashboard");
        router.push(target);
        router.refresh();
      }
    } catch (err) {
      setError(t("auth.loginErrorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB] pt-24">
      <div className="section-container">
        <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-surface p-8 shadow-sm">
          <Link href="/" className="inline-block">
            <Image
              src="/logo-vdb.png"
              alt="VDB Digital — Inloggen"
              width={220}
              height={72}
              sizes="220px"
              priority
              className="h-16 w-auto object-contain md:h-[4.5rem]"
            />
          </Link>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
            {t("auth.login")}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {t("auth.loginSubtitle")}
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700">{t("auth.emailLabel")}</label>
              <input
                type="email"
                className="input-light mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">{t("auth.passwordLabel")}</label>
              <input
                type="password"
                className="input-light mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? t("auth.loggingIn") : t("auth.login")}
            </button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-surface px-2 text-slate-500">of</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t("auth.signInWithGoogle")}
            </button>
            {error && <p className="error-text text-red-600">{error}</p>}
          </form>
          <p className="mt-4 text-sm text-slate-600">
            <Link href="/reset-password" className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline">
              {t("auth.forgotPassword")}
            </Link>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline">
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
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB] pt-24">
        <div className="section-container">
          <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-surface p-8 animate-pulse">
            <div className="h-8 w-24 bg-slate-200 rounded" />
            <div className="mt-6 h-8 bg-slate-200 rounded w-3/4" />
            <div className="mt-4 h-4 bg-slate-200 rounded w-full" />
            <div className="mt-6 h-12 bg-slate-200 rounded w-full" />
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
