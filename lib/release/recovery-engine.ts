import { logger } from "@/lib/logger";

function getOrigin(): string {
  const url = process.env.VERCEL_URL?.trim();
  if (url) return `https://${url}`;
  const port = process.env.PORT ?? "3000";
  return `http://127.0.0.1:${port}`;
}

function getHealthHeaders(): Record<string, string> {
  const secret = process.env.HEALTHCHECK_SECRET?.trim();
  if (!secret) return {};
  return {
    "x-health-secret": secret,
  };
}

async function fetchJson(url: string, init?: RequestInit, timeoutMs = 5000): Promise<{ status: number; json: any | null }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal, cache: "no-store" });
    let json: any | null = null;
    try {
      json = await res.json();
    } catch {
      // ignore
    }
    return { status: res.status, json };
  } finally {
    clearTimeout(t);
  }
}

export async function verifyPostRollbackHealth(): Promise<{
  ok: boolean;
  lastCheck?: { status: number; body: any | null; url: string };
}> {
  const origin = getOrigin();
  const deepUrl = `${origin}/api/health`;
  const headers = getHealthHeaders();

  for (let i = 0; i < 6; i++) {
    const { status, json } = await fetchJson(deepUrl, { headers }, 5000);
    const ok = status === 200 && json?.status === "ok";
    if (ok) {
      logger.info("[selfheal] Health recovered after rollback", { url: deepUrl });
      return { ok: true };
    }
    logger.warn("[selfheal] Waiting for health recovery...", {
      attempt: i + 1,
      url: deepUrl,
      status,
      healthStatus: json?.status,
    });
    await new Promise((r) => setTimeout(r, 10_000));
  }

  return {
    ok: false,
    lastCheck: undefined,
  };
}

