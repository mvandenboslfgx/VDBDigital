"use client";

import { forwardRef } from "react";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-midnight placeholder-slate-400 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50";

const textareaClass = inputClass + " min-h-[120px] resize-y";

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const fieldId = id ?? `field-${label.replace(/\s/g, "-").toLowerCase()}`;
    return (
      <div className="w-full">
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-midnight">
          {label}
        </label>
        <input
          ref={ref}
          id={fieldId}
          className={`${inputClass} ${error ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 " : ""} ${className}`}
          {...props}
        />
        {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export interface FormTextFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const FormTextField = forwardRef<HTMLTextAreaElement, FormTextFieldProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const fieldId = id ?? `field-${label.replace(/\s/g, "-").toLowerCase()}`;
    return (
      <div className="w-full">
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-midnight">
          {label}
        </label>
        <textarea
          ref={ref}
          id={fieldId}
          className={`${textareaClass} ${error ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 " : ""} ${className}`}
          {...props}
        />
        {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

FormTextField.displayName = "FormTextField";
