"use client";

import { useEffect, useState } from "react";

const getCsrfTokenFromCookie = () => {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("vdb_csrf="));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
};

type ContentBlock = {
  id: string;
  key: string;
  value: string;
};

type PackageConfig = {
  id: string;
  name: string;
  price: number;
  description: string;
  active: boolean;
};

export default function AdminCmsPanel() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [packages, setPackages] = useState<PackageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [contentRes, pkgRes] = await Promise.all([
          fetch("/api/admin/content"),
          fetch("/api/admin/packages"),
        ]);
        const contentJson = (await contentRes.json()) as {
          success: boolean;
          blocks?: ContentBlock[];
        };
        const pkgJson = (await pkgRes.json()) as {
          success: boolean;
          packages?: PackageConfig[];
        };
        if (contentJson.blocks) setBlocks(contentJson.blocks);
        if (pkgJson.packages) setPackages(pkgJson.packages);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const upsertBlock = async (key: string, value: string) => {
    setSaving(true);
    setMessage(null);
    try {
      const csrf = getCsrfTokenFromCookie();
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrf,
        },
        body: JSON.stringify({ key, value }),
      });
      const data = (await res.json()) as { success: boolean; message: string };
      if (!res.ok || !data.success) {
        throw new Error(data.message);
      }
      setMessage("Content saved.");
      setBlocks((prev) => {
        const existing = prev.find((b) => b.key === key);
        if (existing) {
          return prev.map((b) => (b.key === key ? { ...b, value } : b));
        }
        return prev.concat({
          id: crypto.randomUUID(),
          key,
          value,
        });
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save content."
      );
    } finally {
      setSaving(false);
    }
  };

  const upsertPackage = async (pkg: {
    name: string;
    price: number;
    description: string;
    active: boolean;
  }) => {
    setSaving(true);
    setMessage(null);
    try {
      const csrf = getCsrfTokenFromCookie();
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrf,
        },
        body: JSON.stringify(pkg),
      });
      const data = (await res.json()) as { success: boolean; message: string };
      if (!res.ok || !data.success) {
        throw new Error(data.message);
      }
      setMessage("Package configuration saved.");
      setPackages((prev) => {
        const existing = prev.find((p) => p.name === pkg.name);
        if (existing) {
          return prev.map((p) =>
            p.name === pkg.name
              ? {
                  ...p,
                  price: pkg.price,
                  description: pkg.description,
                  active: pkg.active,
                }
              : p
          );
        }
        return prev.concat({
          id: crypto.randomUUID(),
          name: pkg.name,
          price: pkg.price,
          description: pkg.description,
          active: pkg.active,
        });
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save package."
      );
    } finally {
      setSaving(false);
    }
  };

  const getBlockValue = (key: string) =>
    blocks.find((b) => b.key === key)?.value ?? "";

  if (loading) {
    return (
      <div className="h-24 animate-pulse rounded-2xl bg-black/50 border border-white/10" />
    );
  }

  return (
    <div className="space-y-6 text-xs text-gray-200">
      <div>
        <p className="font-semibold text-white">Hero content</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-[11px] text-gray-400">Hero title key</span>
            <input
              className="input-base"
              defaultValue={getBlockValue("hero_title")}
              onBlur={(e) => upsertBlock("hero_title", e.target.value)}
            />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] text-gray-400">
              Hero subtitle key
            </span>
            <input
              className="input-base"
              defaultValue={getBlockValue("hero_subtitle")}
              onBlur={(e) => upsertBlock("hero_subtitle", e.target.value)}
            />
          </label>
        </div>
      </div>

      <div>
        <p className="font-semibold text-white">Packages</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {["Starter", "Business", "Elite"].map((name) => {
            const existing = packages.find((p) => p.name === name);
            return (
              <div
                key={name}
                className="rounded-2xl border border-white/10 bg-black/60 p-3 space-y-2"
              >
                <p className="text-[11px] font-semibold text-gray-200">
                  {name}
                </p>
                <label className="space-y-1">
                  <span className="text-[11px] text-gray-400">Price (cents)</span>
                  <input
                    type="number"
                    className="input-base"
                    defaultValue={existing?.price ?? ""}
                    onBlur={(e) =>
                      upsertPackage({
                        name,
                        price: Number(e.target.value || 0),
                        description: existing?.description ?? "",
                        active: existing?.active ?? true,
                      })
                    }
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[11px] text-gray-400">
                    Short description
                  </span>
                  <input
                    className="input-base"
                    defaultValue={existing?.description ?? ""}
                    onBlur={(e) =>
                      upsertPackage({
                        name,
                        price: existing?.price ?? 0,
                        description: e.target.value,
                        active: existing?.active ?? true,
                      })
                    }
                  />
                </label>
                <label className="mt-1 flex items-center gap-2 text-[11px] text-gray-400">
                  <input
                    type="checkbox"
                    defaultChecked={existing?.active ?? true}
                    onChange={(e) =>
                      upsertPackage({
                        name,
                        price: existing?.price ?? 0,
                        description: existing?.description ?? "",
                        active: e.target.checked,
                      })
                    }
                  />
                  Active
                </label>
              </div>
            );
          })}
        </div>
      </div>
      {message && (
        <p className="mt-2 text-[11px] text-gray-400">
          {saving ? "Saving…" : message}
        </p>
      )}
    </div>
  );
}

