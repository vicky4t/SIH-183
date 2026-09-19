import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/app/lib/formatters";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  icon,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900/20 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs font-semibold",
    md: "px-4 py-2 text-sm font-semibold",
    lg: "px-5 py-2.5 text-base font-semibold",
  };

  const variantStyles = {
    primary:
      "bg-blue-900 hover:bg-navy-800 text-white shadow-sm border border-navy-900",
    secondary:
      "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm",
    outline:
      "bg-transparent hover:bg-slate-50 text-slate-700 border border-slate-300",
    danger:
      "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900",
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
