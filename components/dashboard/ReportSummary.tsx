"use client";

import { motion } from "framer-motion";
import Panel from "@/components/ui/Panel";
import type { ReportSections } from "@/lib/parse-report-sections";

export default function ReportSummary({ sections }: { sections: ReportSections }) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Panel title="Belangrijkste problemen">
          <div className="whitespace-pre-wrap text-sm text-zinc-300 leading-relaxed">
            {sections.problemen}
          </div>
        </Panel>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        <Panel title="Aanbevolen verbeteringen">
          <div className="whitespace-pre-wrap text-sm text-zinc-300 leading-relaxed">
            {sections.verbeteringen}
          </div>
        </Panel>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <Panel title="Geschatte groeikans">
          <div className="whitespace-pre-wrap text-sm text-zinc-300 leading-relaxed">
            {sections.groeikans}
          </div>
        </Panel>
      </motion.div>
    </div>
  );
}
