"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui";

interface BentoStat {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
}

interface ActivityItem {
  id: string;
  event: string;
  createdAt: Date;
}

interface QuickAction {
  label: string;
  href: string;
  icon?: string;
}

interface DashboardBentoGridProps {
  stats: BentoStat[];
  recentActivity: ActivityItem[];
  quickActions: QuickAction[];
  recentReports: Array<{ report: { id: string; url: string; createdAt: Date } }>;
  lastScore: number | null;
  userRole: string;
  t: (key: string) => string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export function DashboardBentoGrid({
  stats,
  recentActivity,
  quickActions,
  recentReports,
  lastScore,
  userRole,
  t,
}: DashboardBentoGridProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:grid-rows-[auto_auto] lg:gap-5"
    >
      {/* Bento: Stats row - 3 cards */}
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          variants={item}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-4"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{stat.label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-midnight md:text-3xl">
            {stat.value}
          </p>
          {stat.subtext && (
            <p className="mt-1 text-sm text-slate-500">{stat.subtext}</p>
          )}
        </motion.div>
      ))}

      {/* Bento: Main content + Quick Actions - 9 + 3 */}
      <motion.div
        variants={item}
        className="rounded-2xl border border-gray-200 bg-surface p-5 shadow-sm lg:col-span-9"
      >
        <h2 className="text-sm font-semibold text-slate-900">{t("dashboard.recentActivity")}</h2>
        <p className="mt-0.5 text-xs text-slate-500">{t("dashboard.recentActivitySubtitle")}</p>
        <ul className="mt-4 space-y-2">
          {recentActivity.length === 0 ? (
            <li className="text-sm text-slate-500">{t("dashboard.noRecentActivity")}</li>
          ) : (
            recentActivity.map((ev) => (
              <li key={ev.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{ev.event}</span>
                <span className="text-slate-400">
                  {new Date(ev.createdAt).toLocaleDateString("nl-NL", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))
          )}
        </ul>
        {recentReports.length > 0 && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-slate-500">Laatste scans</p>
            <ul className="mt-2 space-y-1">
              {recentReports.slice(0, 3).map(({ report }) => (
                <li key={report.id}>
                  <Link
                    href={`/dashboard/reports/${report.id}`}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    {report.url.replace(/^https?:\/\//, "").slice(0, 45)}…
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>

      {/* Quick Actions panel */}
      <motion.div
        variants={item}
        className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm lg:col-span-3"
      >
        <h2 className="text-sm font-semibold text-midnight">Quick Actions</h2>
        <ul className="mt-4 space-y-2">
          {quickActions.map((action) => (
            <li key={action.href}>
              <Link
                href={action.href}
                className="block rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-midnight shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/50"
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Link>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}
