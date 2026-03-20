"use client";

import { useState } from "react";

const CATEGORIES = [
  { value: "seo", label: "SEO" },
  { value: "website-snelheid", label: "Website snelheid" },
  { value: "conversie", label: "Conversie" },
  { value: "ai-marketing", label: "AI marketing" },
  { value: "digitale-strategie", label: "Digitale strategie" },
];

export function ContentGeneratorClient() {
  const [topic, setTopic] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [titles, setTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [content, setContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [category, setCategory] = useState("seo");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState<"ideas" | "titles" | "article" | "save" | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const loadIdeas = async () => {
    setLoading("ideas");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/content-generator/ideas");
      if (!res.ok) throw new Error("Ophalen mislukt");
      const data = await res.json();
      setIdeas(data.ideas ?? []);
      setTools(data.tools ?? []);
    } catch {
      setMessage({ type: "err", text: "Ideeën konden niet worden geladen." });
    } finally {
      setLoading(null);
    }
  };

  const generateTitles = async () => {
    const t = topic.trim();
    if (!t) {
      setMessage({ type: "err", text: "Vul een onderwerp in." });
      return;
    }
    setLoading("titles");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/content-generator/titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Genereren mislukt");
      setTitles(data.titles ?? []);
      setSelectedTitle("");
      setContent("");
      setSeoTitle("");
      setSeoDescription("");
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Genereren mislukt." });
    } finally {
      setLoading(null);
    }
  };

  const generateArticle = async () => {
    const title = selectedTitle.trim() || topic.trim();
    if (!title) {
      setMessage({ type: "err", text: "Selecteer een titel of vul een onderwerp in." });
      return;
    }
    setLoading("article");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/content-generator/article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Genereren mislukt");
      setContent(data.content ?? "");
      setSeoTitle(data.seoTitle ?? title);
      setSeoDescription(data.seoDescription ?? "");
      setSlug(title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Genereren mislukt." });
    } finally {
      setLoading(null);
    }
  };

  const save = async (publish: boolean) => {
    if (!content.trim() || !seoTitle.trim()) {
      setMessage({ type: "err", text: "Content en SEO-titel zijn verplicht." });
      return;
    }
    setLoading("save");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/content-generator/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedTitle.trim() || seoTitle,
          slug: slug.trim() || undefined,
          content,
          category,
          seoTitle,
          seoDescription: seoDescription.trim() || undefined,
          publish,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Opslaan mislukt");
      setMessage({
        type: "ok",
        text: `Opgeslagen. ${publish ? "Gepubliceerd op" : "Concept:"} /kennisbank/${data.slug}`,
      });
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Opslaan mislukt." });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mt-8 space-y-8">
      {message && (
        <p
          className={`rounded-lg px-4 py-2 text-sm ${
            message.type === "ok" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Content-ideeën
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Gebaseerd op SEO-onderwerpen en populaire tools. Klik om als onderwerp te gebruiken.
        </p>
        <button
          type="button"
          onClick={loadIdeas}
          disabled={loading === "ideas"}
          className="mt-3 rounded-lg bg-indigo-500/20 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/30 disabled:opacity-50"
        >
          {loading === "ideas" ? "Laden…" : "Laad ideeën"}
        </button>
        {(ideas.length > 0 || tools.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {ideas.map((idea) => (
              <button
                key={idea}
                type="button"
                onClick={() => setTopic(idea)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10"
              >
                {idea}
              </button>
            ))}
            {tools.length > 0 && (
              <>
                <span className="text-gray-500">|</span>
                {tools.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10"
                  >
                    {t}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Stap 1: Titels genereren
        </h2>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Onderwerp of titel (bijv. SEO tips)"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={generateTitles}
            disabled={loading === "titles"}
            className="rounded-lg bg-indigo-500/20 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/30 disabled:opacity-50"
          >
            {loading === "titles" ? "Bezig…" : "Genereer titels"}
          </button>
        </div>
        {titles.length > 0 && (
          <ul className="mt-4 space-y-2">
            {titles.map((t) => (
              <li key={t}>
                <button
                  type="button"
                  onClick={() => setSelectedTitle(t)}
                  className={`w-full rounded-lg border px-4 py-2 text-left text-sm transition ${
                    selectedTitle === t
                      ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-400"
                      : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Stap 2: Artikel genereren
        </h2>
        <button
          type="button"
          onClick={generateArticle}
          disabled={loading === "article" || (!selectedTitle && !topic.trim())}
          className="mt-3 rounded-lg bg-indigo-500/20 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/30 disabled:opacity-50"
        >
          {loading === "article" ? "Bezig…" : "Genereer volledig artikel"}
        </button>
      </section>

      {(content || seoTitle) && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Stap 3: Bewerken en opslaan
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs text-gray-500">SEO-titel</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                maxLength={100}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-indigo-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">SEO-description (max 500)</label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                maxLength={500}
                rows={2}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-indigo-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Slug (URL)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="artikel-slug"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Categorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-indigo-500/50 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500">Content (Markdown)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-mono text-sm text-gray-300 focus:border-indigo-500/50 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => save(false)}
                disabled={loading === "save"}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50"
              >
                {loading === "save" ? "Bezig…" : "Opslaan als concept"}
              </button>
              <button
                type="button"
                onClick={() => save(true)}
                disabled={loading === "save"}
                className="rounded-lg bg-indigo-500/20 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/30 disabled:opacity-50"
              >
                {loading === "save" ? "Bezig…" : "Publiceren"}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
