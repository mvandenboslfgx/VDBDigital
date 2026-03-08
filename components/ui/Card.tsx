"use client";

import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: "",
  sm: "p-4",   /* 16 */
  md: "p-6",   /* 24 */
  lg: "p-8",   /* 32 */
};

export default function Card({
  children,
  className = "",
  hover = true,
  padding = "md",
}: CardProps) {
  const Wrapper = hover ? motion.div : "div";
  const paddingClass = paddingMap[padding];

  const shared =
    "rounded-2xl border border-white/[0.06] bg-[#111113] shadow-panel " +
    paddingClass +
    " " +
    className;

  if (hover) {
    return (
      <Wrapper
        className={shared}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </Wrapper>
    );
  }

  return <div className={shared}>{children}</div>;
}
