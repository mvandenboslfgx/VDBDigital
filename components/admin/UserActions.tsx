"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PlanOption {
  id: string;
  name: string;
  price: number;
}

interface UserActionsProps {
  userId: string;
  userEmail: string;
  currentRole: string;
  currentPlanId: string | null;
  isDisabled: boolean;
  isOwner: boolean;
  plans: PlanOption[];
}

export function UserActions({
  userId,
  userEmail,
  currentRole,
  currentPlanId,
  isDisabled,
  isOwner,
  plans,
}: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isOwner) {
    return <span className="text-zinc-500">—</span>;
  }

  const handleUpdate = async (data: { role?: string; planId?: string | null; disabledAt?: string | null }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...data }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Update failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete user ${userEmail}? This cannot be undone.`)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/delete?userId=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Delete failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={currentRole}
          onChange={(e) => handleUpdate({ role: e.target.value })}
          disabled={loading}
          className="rounded border border-white/20 bg-black/60 px-2 py-1 text-xs text-white"
        >
          <option value="lead">Lead</option>
          <option value="customer">Customer</option>
          <option value="pro">Pro</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={currentPlanId ?? ""}
          onChange={(e) => handleUpdate({ planId: e.target.value || null })}
          disabled={loading}
          className="rounded border border-white/20 bg-black/60 px-2 py-1 text-xs text-white"
        >
          <option value="">—</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (€{p.price / 100})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => handleUpdate({ disabledAt: isDisabled ? null : new Date().toISOString() })}
          disabled={loading}
          className="rounded border border-amber-500/50 px-2 py-1 text-xs text-amber-400 hover:bg-amber-500/10"
        >
          {isDisabled ? "Enable" : "Disable"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="rounded border border-red-500/50 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
        >
          Delete
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
