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
        const target = role === "admin" || role === "owner" ? "/admin" : getSafeRedirect(next);
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
              alt="VDB Digital"
              width={220}
              height={72}
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
            {error && <p className="error-text text-red-600">{error}</p>}
          </form>
          <p className="mt-4 text-sm text-slate-600">
            <Link href="/reset-password" className="text-[#B89B50] font-medium hover:text-[#C6A95D] hover:underline">
              {t("auth.forgotPassword")}
            </Link>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="text-[#B89B50] font-medium hover:text-[#C6A95D] hover:underline">
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
