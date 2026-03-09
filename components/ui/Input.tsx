"use client";

import { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-midnight">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={
            "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-midnight placeholder-slate-400 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 " +
            (error ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 " : "") +
            className
          }
          {...props}
        />
        {hint && !error && (
          <p className="mt-2 text-xs text-slate-500">{hint}</p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
