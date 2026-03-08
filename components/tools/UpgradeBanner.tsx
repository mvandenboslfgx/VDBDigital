"use client";

import Link from "next/link";
import { Button } from "@/components/ui";

export default function UpgradeBanner() {
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center">
      <p className="text-sm font-medium text-amber-200/90">
        Meer scans en AI-tools? Upgrade voor onbeperkte inzichten.
      </p>
      <Link href="/pricing" className="mt-4 inline-block">
        <Button size="md">Bekijk abonnementen</Button>
      </Link>
    </div>
  );
}
