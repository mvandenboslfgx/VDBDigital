import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** Max width: default same as section-container (max-w-6xl) */
  size?: "default" | "narrow" | "wide";
}

const sizeClass = {
  default: "max-w-6xl",
  narrow: "max-w-3xl",
  wide: "max-w-7xl",
};

export default function Container({ children, className = "", size = "default" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${sizeClass[size]} ${className}`}>
      {children}
    </div>
  );
}
