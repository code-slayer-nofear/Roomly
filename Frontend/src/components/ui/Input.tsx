import { forwardRef } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type InputProps = {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  as?: "input" | "textarea";
} & (InputHTMLAttributes<HTMLInputElement> | TextareaHTMLAttributes<HTMLTextAreaElement>);

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ label, error, leftIcon, as = "input", className = "", ...props }, ref) => {
    const sharedClasses = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${leftIcon ? "pl-9" : ""} ${error ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"} disabled:bg-gray-50 disabled:text-gray-400 ${className}`;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-gray-700">{label}</label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          {as === "textarea" ? (
            <textarea
              ref={ref as React.LegacyRef<HTMLTextAreaElement>}
              className={sharedClasses}
              {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.LegacyRef<HTMLInputElement>}
              className={sharedClasses}
              {...(props as InputHTMLAttributes<HTMLInputElement>)}
            />
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
