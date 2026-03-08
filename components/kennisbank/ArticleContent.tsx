"use client";

/**
 * Renders markdown content as semantic HTML. Supports ## H2, ### H3, paragraphs and bold.
 */

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m] ?? m);
}

export function ArticleContent({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      const id = trimmed.slice(4).replace(/\s+/g, "-").toLowerCase().replace(/[^a-z0-9-]/g, "");
      nodes.push(
        <h3 key={key++} id={id || undefined} className="mt-8 text-xl font-semibold text-marketing-text">
          {escapeHtml(trimmed.slice(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      const id = trimmed.slice(3).replace(/\s+/g, "-").toLowerCase().replace(/[^a-z0-9-]/g, "");
      nodes.push(
        <h2 key={key++} id={id || undefined} className="mt-10 text-2xl font-semibold text-marketing-text first:mt-0">
          {escapeHtml(trimmed.slice(3))}
        </h2>
      );
      i++;
      continue;
    }
    if (trimmed === "") {
      i++;
      continue;
    }
    const paragraphLines: string[] = [trimmed];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].trim().startsWith("#")) {
      paragraphLines.push(lines[i].trim());
      i++;
    }
    const html = escapeHtml(paragraphLines.join(" "))
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
    nodes.push(
      <p key={key++} className="mt-4 leading-relaxed text-marketing-textSecondary" dangerouslySetInnerHTML={{ __html: html }} />
    );
  }

  return <div className="article-content space-y-1">{nodes}</div>;
}
