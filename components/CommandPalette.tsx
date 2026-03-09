"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";

interface CommandItem {
  id: string;
  label: string;
  href?: string;
  keywords?: string[];
  group: string;
}

const COMMANDS: CommandItem[] = [
  { id: "home", label: "Home", href: "/", keywords: ["start"], group: "Navigatie" },
  { id: "website-scan", label: "Start website scan", href: "/website-scan", keywords: ["scan", "audit"], group: "Acties" },
  { id: "tools", label: "AI Tools", href: "/tools", keywords: ["tools"], group: "Navigatie" },
  { id: "website-audit", label: "Website audit tool", href: "/tools/website-audit", keywords: ["audit"], group: "Tools" },
  { id: "prijzen", label: "Prijzen", href: "/prijzen", keywords: ["pricing", "plannen"], group: "Navigatie" },
  { id: "dashboard", label: "Dashboard", href: "/dashboard", keywords: ["overzicht"], group: "Account" },
  { id: "dashboard-audits", label: "Mijn scans", href: "/dashboard/audits", keywords: ["scans"], group: "Account" },
  { id: "dashboard-reports", label: "Rapporten", href: "/dashboard/reports", keywords: ["rapporten"], group: "Account" },
  { id: "dashboard-settings", label: "Instellingen", href: "/dashboard/settings", keywords: ["profiel", "account"], group: "Account" },
  { id: "contact", label: "Contact", href: "/contact", keywords: ["contact"], group: "Navigatie" },
  { id: "kennisbank", label: "Kennisbank", href: "/kennisbank", keywords: ["kennis"], group: "Navigatie" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (href: string) => {
    if (href) {
      router.push(href);
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[20vh]" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          label="Command Palette"
          className="[&_[cmdk-input]]:h-12 [&_[cmdk-input]]:px-4 [&_[cmdk-input]]:text-base [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-slate-500 [&_[cmdk-item]]:px-4 [&_[cmdk-item]]:py-3"
        >
          <Command.Input placeholder="Zoek of typ een opdracht… (⌘K)" autoFocus />
          <Command.List className="max-h-[320px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-slate-500">
              Geen resultaten gevonden.
            </Command.Empty>
            {["Acties", "Navigatie", "Tools", "Account"].map((group) => (
              <Command.Group key={group} heading={group}>
                {COMMANDS.filter((c) => c.group === group).map((item) => (
                  <Command.Item
                    key={item.id}
                    value={`${item.label} ${item.keywords?.join(" ") ?? ""} ${item.href ?? ""}`}
                    onSelect={() => handleSelect(item.href ?? "")}
                    className="cursor-pointer rounded-lg aria-selected:bg-indigo-50 aria-selected:text-indigo-900"
                  >
                    {item.label}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
        <p className="border-t border-gray-100 px-4 py-2 text-xs text-slate-500">
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5">⌘</kbd> + <kbd className="rounded bg-slate-100 px-1.5 py-0.5">K</kbd> om te openen
        </p>
      </div>
    </div>
  );
}
