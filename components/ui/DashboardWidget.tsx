"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface DashboardWidgetProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: { label: string; href: string };
  className?: string;
}

export default function DashboardWidget({
  title,
  subtitle,
  children,
  action,
  className = "",
}: DashboardWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05)" }}
      className={
        "rounded-2xl border border-gray-200 bg-white shadow-saas-card transition-shadow duration-300 " +
        className
      }
    >
      <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && (
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
        {action && (
          <Link
            href={action.href}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            {action.label} →
          </Link>
        )}
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}
