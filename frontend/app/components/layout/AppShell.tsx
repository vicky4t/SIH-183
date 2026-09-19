"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { X } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 antialiased selection:bg-navy-900 selection:text-white">
      {/* Desktop Fixed Sidebar (Navy Blue) */}
      <div className="hidden md:block w-64 shrink-0 fixed inset-y-0 left-0 z-30 shadow-md">
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm md:hidden flex"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 h-full bg-navy-900 text-white shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-lg"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area (Crisp White / Slate-50) */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen min-w-0 bg-slate-50">
        <Topbar onToggleMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
