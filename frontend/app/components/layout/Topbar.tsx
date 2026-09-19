"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ShieldCheck, Menu } from "lucide-react";

interface TopbarProps {
  onToggleMobileMenu?: () => void;
}

export function Topbar({ onToggleMobileMenu }: TopbarProps) {
  const pathname = usePathname() || "";

  const getPageDetails = () => {
    if (pathname.startsWith("/investigate")) {
      return {
        eyebrow: "",
        title: "Blockchain Investigation",
      };
    }
    if (pathname.startsWith("/cases")) {
      return {
        eyebrow: "",
        title: "Investigation Cases",
      };
    }
    if (pathname.startsWith("/alerts")) {
      return {
        eyebrow: "",
        title: "Security & Risk Alerts",
      };
    }
    if (pathname.startsWith("/reports")) {
      return {
        eyebrow: "",
        title: "Investigation Reports",
      };
    }
    if (pathname.startsWith("/settings")) {
      return {
        eyebrow: "",
        title: "Platform Settings",
      };
    }
    return {
      eyebrow: "",
      title: "Intelligence Dashboard",
    };
  };

  const { eyebrow, title } = getPageDetails();

  return (
    <header className="h-16 px-3 sm:px-4 md:px-6 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-sm gap-2">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 sm:p-2 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <div className="text-[9px] sm:text-[10px] font-bold tracking-wider sm:tracking-widest text-navy-700 uppercase font-mono truncate">
            {eyebrow}
          </div>
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight leading-tight truncate">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-mono text-[10px] sm:text-[11px] text-slate-800 font-semibold whitespace-nowrap">
            <span className="hidden sm:inline">Blockchain Network Live</span>
            <span className="sm:hidden">Live</span>
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-blue-700 shrink-0" />
        </div>
      </div>
    </header>
  );
}
