import React from "react";
import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from "lucide-react";
import { cn } from "@/app/lib/formatters";

interface StatusBannerProps {
  type?: "success" | "error" | "warning" | "info" | "loading";
  message: string;
  className?: string;
}

export function StatusBanner({
  type = "info",
  message,
  className,
}: StatusBannerProps) {
  const styles = {
    success:
      "bg-emerald-50 border-emerald-200 text-emerald-800",
    error:
      "bg-rose-50 border-rose-200 text-rose-800",
    warning:
      "bg-amber-50 border-amber-200 text-amber-800",
    info:
      "bg-blue-50 border-blue-200 text-blue-800",
    loading:
      "bg-slate-100 border-slate-200 text-slate-800",
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    loading: <Loader2 className="w-5 h-5 text-slate-600 shrink-0 animate-spin" />,
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium shadow-sm",
        styles[type],
        className
      )}
    >
      {icons[type]}
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}
