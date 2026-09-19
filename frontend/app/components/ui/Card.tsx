import React from "react";
import { cn } from "@/app/lib/formatters";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: "cyan" | "blue" | "rose" | "none";
}

const glowStyles = {
  cyan: "ring-1 ring-cyan-400/50 shadow-cyan-100",
  blue: "ring-1 ring-blue-400/50 shadow-blue-100",
  rose: "ring-1 ring-rose-400/50 shadow-rose-100",
  none: "",
};

export function Card({
  children,
  className,
  glow = "none",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 text-slate-900",
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between pb-3 border-b border-slate-100 mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  subtitle,
}: {
  children: React.ReactNode;
  className?: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h3 className={cn("text-base font-bold text-slate-900 tracking-tight", className)}>
        {children}
      </h3>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}
