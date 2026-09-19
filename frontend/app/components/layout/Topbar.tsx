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
        eyebrow: "SIH26183 • REAL-TIME FORENSICS",
        title: "Blockchain Investigation",
      };
    }
    if (pathname.startsWith("/cases")) {
      return {
        eyebrow: "CASE MANAGEMENT SYSTEM",
        title: "Investigation Cases",
      };
    }
    if (pathname.startsWith("/alerts")) {
      return {
        eyebrow: "THREAT INTELLIGENCE FEED",
        title: "Security & Risk Alerts",
      };
    }
    if (pathname.startsWith("/reports")) {
      return {
        eyebrow: "FORENSIC EVIDENCE EXPORTER",
        title: "Investigation Reports",
      };
    }
    if (pathname.startsWith("/settings")) {
      return {
        eyebrow: "SYSTEM & BACKEND STATUS",
        title: "Platform Settings",
      };
    }
    return {
      eyebrow: "SIH26183 • DIGITAL ASSET FORENSICS",
      title: "Intelligence Dashboard",
    };
  };

  const { eyebrow, title } = getPageDetails();

  return (
    <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-4">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <div className="text-[10px] font-bold tracking-widest text-navy-700 uppercase font-mono">
            {eyebrow}
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px] text-slate-800 font-semibold">
            Blockchain Network Live
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-blue-700 ml-0.5" />
        </div>
      </div>
    </header>
  );
}
