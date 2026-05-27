"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "gradient";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-primary text-white hover:brightness-110 shadow-button active:scale-[0.97] transition-all duration-150",
  secondary:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 active:scale-[0.97] transition-all duration-150",
  outline:
    "border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 dark:border-primary/40 dark:text-primary-light active:scale-[0.97] transition-all duration-150",
  ghost:
    "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 active:scale-[0.97] transition-all duration-150",
  danger:
    "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 active:scale-[0.97] transition-all duration-150",
  gradient:
    "gradient-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.97] transition-all duration-150",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={props.type ?? "button"}
        disabled={disabled ?? isLoading}
        aria-busy={isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-2xl font-medium",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/50",
          "disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
            <span>جاري التحميل...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
