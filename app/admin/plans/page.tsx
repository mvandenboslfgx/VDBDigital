import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlanEditor } from "@/components/admin/PlanEditor";

export default async function OwnerPlansPage() {
  const user = await requireOwner();
  if (!user) redirect("/dashboard");

  const plans = await prisma.plan.findMany({
    where: { active: true },
    orderBy: { price: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Plans</h1>
        <p className="mt-1 text-sm text-gray-400">
          Edit price, aiLimit, calculatorLimit, projectLimit. Stored in DB Plan (features JSON).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const features = (plan.features as Record<string, unknown>) ?? {};
          const aiLimit = features.aiLimit as number | undefined;
          const calculatorLimit = features.calculatorLimit as number | undefined;
          const projectLimit = features.projectLimit as number | undefined;
          return (
            <div
              key={plan.id}
              className="rounded-2xl border border-white/10 bg-black/80 p-6"
            >
              <h2 className="text-lg font-semibold text-white">{plan.name}</h2>
              <PlanEditor
                planId={plan.id}
                planName={plan.name}
                price={plan.price}
                aiLimit={aiLimit ?? 0}
                calculatorLimit={calculatorLimit ?? 0}
                projectLimit={projectLimit ?? 0}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
