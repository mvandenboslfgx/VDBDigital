"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white font-medium shadow-sm border-0 hover:bg-indigo-700 transition-all duration-200",
  secondary:
    "border border-gray-300 bg-white text-slate-900 hover:bg-gray-50 transition-all duration-200",
  ghost:
    "bg-transparent text-slate-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-slate-900 transition-all duration-200",
  outline:
    "bg-transparent text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50 hover:border-indigo-700 transition-all duration-200",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-8 px-4 py-2 text-xs rounded-xl",
  md: "min-h-12 px-6 py-3 text-sm rounded-xl",
  lg: "min-h-14 px-8 py-4 text-base rounded-xl",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      asChild,
      isLoading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
    const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

    if (asChild) {
      return (
        <motion.span
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          style={{ willChange: "transform" }}
          className={classes}
        >
          {children}
        </motion.span>
      );
    }

    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        style={{ willChange: "transform" }}
        className="inline-block"
      >
        <button
          ref={ref}
          className={classes}
          disabled={disabled || isLoading}
          {...props}
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span className="sr-only">Bezig</span>
            </>
          ) : (
            children
          )}
        </button>
      </motion.div>
    );
  }
);

Button.displayName = "Button";

export default Button;
