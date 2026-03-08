"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "@/components/I18nProvider";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  createdAt: string;
}

export default function NotificationBell() {
  const { t } = useTranslations();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications ?? []);
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
        aria-label={t("notifications.ariaLabel")}
        aria-expanded={open}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 6H9"
          />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gold" />
        )}
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-1 w-80 rounded-xl border border-white/10 bg-[#111113] py-2 shadow-xl">
            <div className="border-b border-white/10 px-4 py-2">
              <h3 className="text-sm font-semibold text-white">{t("notifications.title")}</h3>
            </div>
            {loading ? (
              <p className="px-4 py-6 text-center text-sm text-zinc-500">
                {t("notifications.loading")}
              </p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-zinc-500">
                {t("notifications.noNew")}
              </p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n.id} className="border-b border-white/5 last:border-0">
                    {n.actionUrl ? (
                      <Link
                        href={n.actionUrl}
                        onClick={() => setOpen(false)}
                        className="block px-4 py-3 text-left transition-colors hover:bg-white/5"
                      >
                        <p className="text-sm font-medium text-white">
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-400">
                          {n.message}
                        </p>
                      </Link>
                    ) : (
                      <div className="px-4 py-3">
                        <p className="text-sm font-medium text-white">
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-400">
                          {n.message}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
