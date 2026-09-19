"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Search,
  FolderOpen,
  LayoutDashboard,
  Bell,
  Settings,
  FileText,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/app/lib/formatters";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname() || "";

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: "Investigate",
      href: "/investigate",
      icon: <Search className="w-4 h-4" />,
    },
    {
      label: "Cases",
      href: "/cases",
      icon: <FolderOpen className="w-4 h-4" />,
    },
    {
      label: "Alerts",
      href: "/alerts",
      icon: <Bell className="w-4 h-4" />,
    },
    {
      label: "Reports",
      href: "/reports",
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  const systemItems = [
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 h-full bg-navy-900 text-white flex flex-col justify-between p-4 select-none border-r border-navy-800">
      <div>
        {/* Brand Header */}
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-3 px-2 py-3 mb-6 rounded-xl bg-navy-800/60 transition-colors group"
        >
          {/* logo small */}
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-wider text-white flex items-center gap-1.5">
              SHADOWTRACE
            </div>
            <div className="text-[10px] tracking-widest text-slate-400 font-semibold uppercase">
              BLOCKCHAIN INTELLIGENCE
            </div>
          </div>
        </Link>

        {/* Navigation Section */}
        <div className="text-[11px] font-bold text-slate-400 tracking-wider px-3 mb-2 uppercase">
          Investigation
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/investigate" && pathname.startsWith("/investigate"));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150",
                  isActive
                    ? "bg-navy-700 text-white shadow-sm border-l-4 border-blue-400 pl-2.5"
                    : "text-slate-300 hover:text-white hover:bg-navy-800/80"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-blue-400" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  {item.label}
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-400" />}
              </Link>
            );
          })}
        </nav>

        {/* System Section */}
        <div className="text-[11px] font-bold text-slate-400 tracking-wider px-3 mt-6 mb-2 uppercase">
          System
        </div>
        <nav className="space-y-1">
          {systemItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150",
                  isActive
                    ? "bg-navy-700 text-white shadow-sm border-l-4 border-blue-400 pl-2.5"
                    : "text-slate-300 hover:text-white hover:bg-navy-800/80"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-blue-400" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  {item.label}
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-400" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Engine Status Card */}
      <div className="p-3 bg-navy-950/70 border border-navy-800 rounded-xl flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="absolute w-4 h-4 rounded-full bg-emerald-400/40 animate-ping" />
        </div>
        <div>
          <div className="text-xs font-semibold text-white">
            Intelligence Engine
          </div>
          <div className="text-[11px] text-emerald-400 font-mono font-medium">
            OPERATIONAL • READY
          </div>
        </div>
      </div>
    </aside>
  );
}
