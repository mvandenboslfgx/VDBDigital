"use client";

import Link from "next/link";

/**
 * Wraps an upgrade CTA link and fires upgrade_clicked when clicked.
 */
export default function UpgradeTrackLink({
  href,
  plan,
  children,
  className,
}: {
  href: string;
  plan: string;
  children: React.ReactNode;
  className?: string;
}) {
  const handleClick = () => {
    try {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "upgrade_clicked", data: { plan } }),
      }).catch(() => {});
    } catch {
      // no-op
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
