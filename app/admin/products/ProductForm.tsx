"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ProductFormProps = {
  className?: string;
  productId?: string;
  initialData?: {
    name: string;
    slug: string;
    description: string;
    shortDescription: string | null;
    price: number;
    images: string[];
    stock: number;
    category: string;
    specifications: Record<string, string>;
    metaTitle: string | null;
    metaDescription: string | null;
  };
};

export function ProductForm({ className = "", productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription ?? "");
  const [price, setPrice] = useState(initialData?.price ?? 0);
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [stock, setStock] = useState(initialData?.stock ?? 0);
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription ?? "");
  const [specsText, setSpecsText] = useState(
    initialData?.specifications && Object.keys(initialData.specifications).length > 0
      ? Object.entries(initialData.specifications)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n")
      : ""
  );

  const slugFromName = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const handleNameChange = (v: string) => {
    setName(v);
    if (!productId && !initialData?.slug) setSlug(slugFromName(v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const specifications: Record<string, string> = {};
    specsText.split("\n").forEach((line) => {
      const i = line.indexOf(":");
      if (i > 0) {
        const k = line.slice(0, i).trim();
        const v = line.slice(i + 1).trim();
        if (k && v) specifications[k] = v;
      }
    });

    try {
      const body = {
        name,
        slug,
        description,
        shortDescription: shortDescription || undefined,
        price: Number(price),
        images,
        stock: Number(stock),
        category,
        specifications: Object.keys(specifications).length ? specifications : undefined,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
      };
      const url = productId ? `/api/admin/products/${productId}` : "/api/admin/products";
      const method = productId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Opslaan mislukt");
        return;
      }
      if (productId) router.refresh();
      else router.push("/admin/products");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/products/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Upload mislukt");
        return;
      }
      if (data.path) setImages((prev) => [...prev, data.path]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-300">Naam *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Slug *</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            pattern="^[a-z0-9-]+$"
            placeholder="bijv. android-tv-box"
            required
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-300">Prijs (EUR) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price || ""}
            onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : 0)}
            required
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Voorraad</label>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300">Categorie</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="bijv. TV Box"
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300">Korte omschrijving (SEO)</label>
        <input
          type="text"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          maxLength={500}
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300">Omschrijving *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={5}
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300">Afbeeldingen</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <div className="mt-1 flex flex-wrap gap-2">
          {images.map((src, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-sm text-gray-300"
            >
              {src}
              <button type="button" onClick={() => removeImage(i)} className="text-red-400 hover:underline">
                ×
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-dashed border-white/20 px-3 py-2 text-sm text-gray-400 hover:border-blue-500 hover:text-blue-400 disabled:opacity-50"
          >
            {uploading ? "Uploaden…" : "+ Upload"}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">Of voeg handmatig URL toe (bijv. /products/foto.jpg)</p>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300">Specificaties (regel: Label: waarde)</label>
        <textarea
          value={specsText}
          onChange={(e) => setSpecsText(e.target.value)}
          rows={4}
          placeholder={"RAM: 4GB\nOpslag: 32GB"}
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300">SEO titel</label>
        <input
          type="text"
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300">SEO omschrijving</label>
        <input
          type="text"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          maxLength={500}
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="mt-8 flex gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Opslaan…" : productId ? "Bijwerken" : "Product aanmaken"}
        </button>
        <Link
          href="/admin/products"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
        >
          Annuleren
        </Link>
      </div>
    </form>
  );
}
