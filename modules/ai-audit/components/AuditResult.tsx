import { motion } from "framer-motion";
import type { AuditResult as AuditResultType } from "../types";
import AuditScoreCard from "./AuditScoreCard";

type Props = {
  url: string;
  result: AuditResultType;
};

const ListSection = ({
  title,
  items,
}: {
  title: string;
  items: string[];
}) => {
  if (!items.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/70 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
        {title}
      </p>
      <ul className="mt-3 space-y-1.5 text-xs text-gray-200">
        {items.map((item, idx) => (
          <li key={`${title}-${idx}`} className="flex gap-2">
            <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-gold/70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export function AuditResult({ url, result }: Props) {
  return (
    <div className="space-y-6">
      <AuditScoreCard score={result.score} url={url} />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <ListSection title="SEO SIGNALS" items={result.seoIssues} />
        <ListSection title="UX + FLOW" items={result.uxIssues} />
        <ListSection title="PERFORMANCE" items={result.speedIssues} />
      </motion.div>
      {result.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.15 }}
          className="rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/10 via-black/90 to-black/95 p-5"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            PRIORITY PLAYBOOK
          </p>
          <ul className="mt-3 space-y-1.5 text-xs text-gray-100">
            {result.recommendations.map((item, idx) => (
              <li key={`rec-${idx}`} className="flex gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-gold" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}

export default AuditResult;

