import { motion } from "framer-motion";
import type { CopyResult } from "../types";

type Props = {
  inputSummary: string;
  result: CopyResult;
};

export function AiCopyResult({ inputSummary, result }: Props) {
  return (
    <section className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="rounded-3xl border border-white/10 bg-black/80 p-5"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
          Concept context
        </p>
        <p className="mt-3 text-xs text-gray-200">{inputSummary}</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
        className="grid gap-4 md:grid-cols-2"
      >
        <div className="rounded-2xl border border-white/10 bg-black/75 p-4 space-y-2 text-xs text-gray-100">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            Hero
          </p>
          <p className="text-sm font-semibold text-white">
            {result.heroHeadline}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/75 p-4 space-y-2 text-xs text-gray-100">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            Services
          </p>
          <p>{result.servicesText}</p>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
        className="grid gap-4 md:grid-cols-2"
      >
        <div className="rounded-2xl border border-white/10 bg-black/75 p-4 space-y-2 text-xs text-gray-100">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            Over
          </p>
          <p>{result.aboutSection}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/75 p-4 space-y-2 text-xs text-gray-100">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            SEO-paragraaf
          </p>
          <p>{result.seoParagraph}</p>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.15 }}
        className="rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/10 via-black/90 to-black/95 p-5 text-xs text-gray-100"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
          Call to action
        </p>
        <p className="mt-3">{result.ctaSection}</p>
      </motion.div>
    </section>
  );
}

export default AiCopyResult;

