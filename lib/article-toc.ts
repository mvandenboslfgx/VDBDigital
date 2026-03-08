/**
 * Extract H2 and H3 headings from markdown content for table of contents.
 */

export type TocItem = { level: 2 | 3; text: string; id: string };

export function getTableOfContents(content: string): TocItem[] {
  const items: TocItem[] = [];
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      const text = trimmed.slice(4);
      const id = text.replace(/\s+/g, "-").toLowerCase().replace(/[^a-z0-9-]/g, "") || "section";
      items.push({ level: 3, text, id });
    } else if (trimmed.startsWith("## ")) {
      const text = trimmed.slice(3);
      const id = text.replace(/\s+/g, "-").toLowerCase().replace(/[^a-z0-9-]/g, "") || "section";
      items.push({ level: 2, text, id });
    }
  }
  return items;
}
