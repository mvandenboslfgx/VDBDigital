"use client";

import { motion } from "framer-motion";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  /** Optional heading above content */
  heading?: string;
  title?: string;
  subtitle?: string;
  /** Glass-style card wrapper */
  glass?: boolean;
}

export default function Section({
  children,
  className = "",
  heading,
  title,
  subtitle,
  glass = false,
}: SectionProps) {
  const content = (
    <>
      {(heading || title) && (
        <div className="mb-8">
          {heading && (
            <p className="section-heading text-zinc-500">{heading}</p>
          )}
          {title && (
            <h2 className="section-title mt-2 max-w-2xl">{title}</h2>
          )}
          {subtitle && (
            <p className="mt-3 text-sub max-w-xl">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </>
  );

  const wrapperClass = glass
    ? "rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 md:p-8 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.3)]"
    : "";

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className={`${wrapperClass} ${className}`}
    >
      {content}
    </motion.section>
  );
}
