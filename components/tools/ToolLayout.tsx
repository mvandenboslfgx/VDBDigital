"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import UpgradeBanner from "./UpgradeBanner";

interface ToolLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  showUpgrade?: boolean;
}

export default function ToolLayout({
  children,
  title,
  description,
  showUpgrade = true,
}: ToolLayoutProps) {
  return (
    <div className="min-h-screen">
      <div className="section-container py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/tools"
            className="text-sm font-medium text-marketing-textSecondary transition-colors hover:text-marketing-text"
          >
            ← Alle tools
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-marketing-text md:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-marketing-textSecondary">{description}</p>
        </motion.div>

        {children}

        {showUpgrade && (
          <div className="mt-12">
            <UpgradeBanner />
          </div>
        )}
      </div>
    </div>
  );
}
