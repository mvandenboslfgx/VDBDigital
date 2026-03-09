"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";

interface ToolCardProps {
  href: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  /** Use "light" for marketing/tools pages inside SiteShell */
  variant?: "dark" | "light";
}

export default function ToolCard({ href, title, description, icon, variant = "dark" }: ToolCardProps) {
  const isLight = variant === "light";
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`group rounded-2xl border p-6 transition-shadow ${
        isLight
          ? "border-marketing-border bg-surface shadow-marketing-card hover:border-gold/30 hover:shadow-marketing-card-hover"
          : "border-white/[0.06] bg-[#111113]/80 backdrop-blur-sm hover:border-white/[0.1] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]"
      }`}
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
      <h3
        className={`text-lg font-semibold ${isLight ? "text-marketing-text" : "text-white"}`}
      >
        {title}
      </h3>
      <p
        className={`mt-2 text-sm line-clamp-2 ${
          isLight ? "text-marketing-textSecondary" : "text-zinc-400"
        }`}
      >
        {description}
      </p>
      <Link href={href} className="mt-4 inline-block" aria-label={`Open ${title}`}>
        <Button size="sm" variant={isLight ? "outline" : "outline"}>
          Gebruiken
        </Button>
      </Link>
    </motion.article>
  );
}
