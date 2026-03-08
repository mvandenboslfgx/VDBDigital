"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { useTranslations } from "@/components/I18nProvider";

export default function BillingPortalButton() {
  const { t } = useTranslations();
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/customer-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await res.json()) as { url?: string };
      if (data?.url) window.location.href = data.url;
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button
      size="md"
      onClick={openPortal}
      disabled={loading}
      aria-busy={loading}
    >
      {loading ? t("billing.opening") : t("billing.openStripePortal")}
    </Button>
  );
}
