"use client";

import { motion } from "framer-motion";

interface ResultPanelProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export default function ResultPanel({ children, title, className = "" }: ResultPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.15)" }}
      style={{ willChange: "transform" }}
      className={
        "rounded-2xl border border-gray-200 bg-white p-8 shadow-saas-card transition-shadow duration-300 " +
        className
      }
    >
      {title && (
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </h3>
      )}
      <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-ul:text-slate-600">
        {children}
      </div>
    </motion.div>
  );
}
