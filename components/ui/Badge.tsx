"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "success" | "warning" | "muted";
  className?: string;
}

const variants: Record<string, string> = {
  default: "bg-white/10 text-zinc-300 border border-white/10",
  gold: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  muted: "bg-zinc-800/80 text-zinc-500 border border-white/5",
};

export default function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
