"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

export default function ShareReportButton({ reportId }: { reportId: string }) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/report/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });
      const data = await res.json();
      if (data.shareUrl) {
        const full = typeof window !== "undefined" ? `${window.location.origin}${data.shareUrl}` : data.shareUrl;
        setShareUrl(full);
        await navigator.clipboard.writeText(full);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="md"
      onClick={handleShare}
      disabled={loading}
    >
      {loading ? "Bezig…" : shareUrl ? "Link gekopieerd" : "Deel rapport"}
    </Button>
  );
}
