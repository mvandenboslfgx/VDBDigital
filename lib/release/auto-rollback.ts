import { logger } from "@/lib/logger";
import { addIncident, canRollbackForDeployment, markRollbackAttempt, type IncidentSeverity, type IncidentSource } from "@/lib/release/incidents";
import { verifyPostRollbackHealth } from "@/lib/release/recovery-engine";

function getOrigin(): string {
  const url = process.env.VERCEL_URL?.trim();
  if (url) return `https://${url}`;
  const port = process.env.PORT ?? "3000";
  return `http://127.0.0.1:${port}`;
}

async function sendSlackAlert(message: string): Promise<void> {
  const webhook = process.env.SLACK_WEBHOOK_URL?.trim();
  if (!webhook) return;
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: message }),
    });
  } catch (e) {
    logger.warn("[selfheal] Slack webhook failed", { error: String(e) });
  }
}

async function rollbackViaVercel(deploymentId: string, token: string): Promise<{ ok: boolean; status: number; body: any | null }> {
  const endpoint = `https://api.vercel.com/v13/deployments/${deploymentId}/rollback`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let body: any | null = null;
  try {
    body = await res.json();
  } catch {
    // ignore
  }

  return { ok: res.ok, status: res.status, body };
}

export async function triggerRollback(params: {
  reason: string;
  severity: IncidentSeverity;
  source: IncidentSource;
  errorSummary?: string;
}): Promise<{ rolledBack: boolean; skipped: boolean; deploymentId: string | null }> {
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID?.trim() ?? null;
  if (!deploymentId) {
    logger.error("[selfheal] Missing VERCEL_DEPLOYMENT_ID; cannot rollback");
    return { rolledBack: false, skipped: true, deploymentId: null };
  }

  const token = process.env.VERCEL_TOKEN?.trim();
  if (!token) {
    logger.error("[selfheal] Missing VERCEL_TOKEN; cannot rollback");
    await addIncident({ deploymentId, reason: "Self-heal rollback blocked: missing VERCEL_TOKEN", severity: "critical", source: params.source, errorSummary: params.errorSummary });
    await sendSlackAlert(`🚨 Self-heal rollback blocked (missing VERCEL_TOKEN).\nDeployment: ${deploymentId}\nReason: ${params.reason}`);
    return { rolledBack: false, skipped: true, deploymentId };
  }

  const guardOk = await canRollbackForDeployment(deploymentId);
  if (!guardOk) {
    const reason = "Self-heal rollback skipped by protection layer (cooldown/duplicate)";
    logger.warn("[selfheal] " + reason, { deploymentId });
    await addIncident({ deploymentId, reason: params.reason + " — " + reason, severity: params.severity, source: params.source, errorSummary: params.errorSummary });
    await sendSlackAlert(`🚨 Deployment rollback skipped by self-heal guard.\nDeployment: ${deploymentId}\nReason: ${params.reason}`);
    return { rolledBack: false, skipped: true, deploymentId };
  }

  // Mark before calling Vercel to avoid duplicate rollbacks when multiple cron runs overlap.
  await markRollbackAttempt(deploymentId);

  let rollbackResult: { ok: boolean; status: number; body: any | null } = { ok: false, status: 0, body: null };
  try {
    rollbackResult = await rollbackViaVercel(deploymentId, token);
  } catch (e) {
    logger.error("[selfheal] Vercel rollback request failed", e instanceof Error ? { error: e.message } : undefined);
  }

  if (!rollbackResult.ok) {
    const reason = `Vercel rollback failed (http=${rollbackResult.status})`;
    await addIncident({ deploymentId, reason: params.reason + " — " + reason, severity: "critical", source: params.source, errorSummary: params.errorSummary });
    await sendSlackAlert(`🚨 Self-heal attempted rollback but Vercel API failed.\nDeployment: ${deploymentId}\nReason: ${params.reason}\nVercelStatus: ${rollbackResult.status}`);
    return { rolledBack: false, skipped: false, deploymentId };
  }

  await addIncident({ deploymentId, reason: params.reason, severity: params.severity, source: params.source, errorSummary: params.errorSummary });

  const origin = getOrigin();
  await sendSlackAlert(
    `🚨 Deployment rolled back due to errors.\nDeployment: ${deploymentId}\nOrigin: ${origin}\nReason: ${params.reason}`
  );

  // Recovery verification: wait & re-check deep health.
  try {
    const recovery = await verifyPostRollbackHealth();
    if (!recovery.ok) {
      logger.warn("[selfheal] Post-rollback health still degraded", { recovery });
    }
  } catch (e) {
    logger.warn("[selfheal] Post-rollback verification threw", { error: String(e) });
  }

  return { rolledBack: true, skipped: false, deploymentId };
}

