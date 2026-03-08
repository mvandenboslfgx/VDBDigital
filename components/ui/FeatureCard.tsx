"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  /** "light" for marketing pages */
  variant?: "dark" | "light";
  className?: string;
}

export default function FeatureCard({
  title,
  description,
  icon,
  variant = "dark",
  className = "",
}: FeatureCardProps) {
  const isLight = variant === "light";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl border p-6 transition-shadow ${
        isLight
          ? "border-marketing-border bg-white shadow-marketing-card hover:shadow-marketing-card-hover"
          : "border-white/[0.06] bg-[#111113]/80 hover:border-white/[0.1]"
      } ${className}`}
    >
      {icon && (
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
            isLight ? "bg-gold/10 text-gold" : "bg-amber-500/10 text-amber-400"
          }`}
        >
          {icon}
        </div>
      )}
      <h3 className={`text-lg font-semibold ${isLight ? "text-marketing-text" : "text-white"}`}>
        {title}
      </h3>
      <p
        className={`mt-2 text-sm leading-relaxed ${
          isLight ? "text-marketing-textSecondary" : "text-zinc-400"
        }`}
      >
        {description}
      </p>
    </motion.div>
  );
}
