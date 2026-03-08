import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserActions } from "@/components/admin/UserActions";

export default async function AdminUsersPage() {
  const user = await requireOwner();
  if (!user) redirect("/dashboard");

  const [users, plans] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        plan: true,
        _count: { select: { aiUsage: true } },
      },
    }),
    prisma.plan.findMany({
      where: { active: true },
      orderBy: { price: "asc" },
      select: { id: true, name: true, price: true },
    }),
  ]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 p-6 shadow-sm backdrop-blur-xl">
      <h1 className="text-xl font-semibold text-white">Users</h1>
      <p className="mt-1 text-sm text-gray-400">
        Manage users, roles, plans. Owner only.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
              <th className="pb-3 pr-4 font-medium">User</th>
              <th className="pb-3 pr-4 font-medium">Email</th>
              <th className="pb-3 pr-4 font-medium">Role</th>
              <th className="pb-3 pr-4 font-medium">Plan</th>
              <th className="pb-3 pr-4 font-medium">Abonnement</th>
              <th className="pb-3 pr-4 font-medium">AI Usage</th>
              <th className="pb-3 pr-4 font-medium">Created</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {users.map((u) => (
              <tr
                key={u.id}
                className={`border-b border-white/5 ${u.disabledAt ? "opacity-60" : ""}`}
              >
                <td className="py-3 pr-4 font-medium text-white">
                  {u.email.split("@")[0]}
                </td>
                <td className="py-3 pr-4 text-gray-400">{u.email}</td>
                <td className="py-3 pr-4 capitalize">{u.role}</td>
                <td className="py-3 pr-4">{u.plan?.name ?? "—"}</td>
                <td className="py-3 pr-4">
                  {u.stripeSubscriptionId ? (
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-xs text-emerald-400">Actief</span>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
                <td className="py-3 pr-4">{u._count.aiUsage}</td>
                <td className="py-3 pr-4">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3">
                  <UserActions
                    userId={u.id}
                    userEmail={u.email}
                    currentRole={u.role}
                    currentPlanId={u.planId}
                    isDisabled={!!u.disabledAt}
                    isOwner={u.role === "owner"}
                    plans={plans}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
