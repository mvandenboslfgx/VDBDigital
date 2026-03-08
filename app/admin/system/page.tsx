import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/admin/MetricCard";

async function checkDatabase(): Promise<"ok" | "error"> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "ok";
  } catch {
    return "error";
  }
}

function checkStripe(): "ok" | "not_configured" | "warning" {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return "not_configured";
  if (key.startsWith("sk_test_")) return "warning";
  return "ok";
}

function checkOpenAI(): "ok" | "not_configured" {
  return process.env.OPENAI_API_KEY ? "ok" : "not_configured";
}

function checkEmail(): "ok" | "not_configured" {
  return process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    ? "ok"
    : "not_configured";
}

export default async function OwnerSystemPage() {
  const user = await requireOwner();
  if (!user) redirect("/dashboard");

  const [db, stripe, ai, email] = await Promise.all([
    checkDatabase(),
    Promise.resolve(checkStripe()),
    Promise.resolve(checkOpenAI()),
    Promise.resolve(checkEmail()),
  ]);

  const statusDb = db === "ok" ? "ok" : "error";
  const statusStripe =
    stripe === "ok" ? "ok" : stripe === "warning" ? "warning" : "error";
  const statusAi = ai === "ok" ? "ok" : "error";
  const statusEmail = email === "ok" ? "ok" : "warning";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">System Health</h1>
        <p className="mt-1 text-sm text-gray-400">
          Database, Stripe, OpenAI, and email service status.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Database"
          value={db === "ok" ? "OK" : "ERROR"}
          status={statusDb}
        />
        <MetricCard
          label="Stripe key"
          value={stripe === "ok" ? "OK" : stripe === "warning" ? "WARNING (test key)" : "NOT CONFIGURED"}
          status={statusStripe}
        />
        <MetricCard
          label="OpenAI key"
          value={ai === "ok" ? "OK" : "NOT CONFIGURED"}
          status={statusAi}
        />
        <MetricCard
          label="Email service"
          value={email === "ok" ? "OK" : "NOT CONFIGURED"}
          status={statusEmail}
        />
      </div>
    </div>
  );
}
