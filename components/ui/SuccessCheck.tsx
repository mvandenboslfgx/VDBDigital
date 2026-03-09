"use client";

import { motion } from "framer-motion";

interface SuccessCheckProps {
  className?: string;
  size?: number;
}

export function SuccessCheck({ className = "", size = 48 }: SuccessCheckProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`inline-flex items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <motion.svg
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.15, duration: 0.35, ease: "easeOut" }}
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.polyline points="20 6 9 17 4 12" />
      </motion.svg>
    </motion.div>
  );
}
