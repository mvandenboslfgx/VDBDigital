"use client";

import { useEffect, useState } from "react";

/**
 * Tab visible → `visibleMs`; background/hidden → `hiddenMs` (saves API + DB load).
 */
export function useAdaptivePollingInterval(visibleMs: number, hiddenMs: number): number {
  const [ms, setMs] = useState(visibleMs);

  useEffect(() => {
    const sync = () => {
      if (typeof document === "undefined") return;
      setMs(document.visibilityState === "hidden" ? hiddenMs : visibleMs);
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [visibleMs, hiddenMs]);

  return ms;
}
