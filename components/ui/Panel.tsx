"use client";

import { motion } from "framer-motion";

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export default function Panel({
  children,
  className = "",
  title,
  subtitle,
}: PanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={
        "rounded-2xl border border-white/[0.06] bg-[#111113] shadow-panel " +
        className
      }
    >
      {(title || subtitle) && (
        <div className="border-b border-white/[0.06] px-6 py-4">
          {title && (
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
          )}
        </div>
      )}
      <div className="p-6">{children}</div>
    </motion.div>
  );
}
