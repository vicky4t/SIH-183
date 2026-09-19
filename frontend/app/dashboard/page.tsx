import React from "react";
import Link from "next/link";
import {
  Activity,
  ChevronRight,
  Database,
  FolderOpen,
  Network,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { getCases } from "@/app/lib/api";
import { Case } from "@/app/types";
import { shortAddress } from "@/app/lib/formatters";
import { Card, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { RiskBadge, StatusBadge } from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let cases: Case[] = [];
  try {
    const data = await getCases();
    cases = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Dashboard server fetch error:", err);
    cases = [];
  }

  const activeCases = cases.filter((c) => c.status !== "ANALYZED").length;
  const analyzedCases = cases.filter((c) => c.status === "ANALYZED").length;
  const evmCases = cases.filter((c) => {
    const chain = (c.chain || "").toUpperCase();
    return chain === "EVM" || chain === "ETHEREUM";
  }).length;
  const recentCases = cases.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold tracking-widest text-navy-900 uppercase font-mono mb-1">
            INVESTIGATION OVERVIEW
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Intelligence Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Overview of cryptocurrency investigations, analyzed cases, and blockchain activity.
          </p>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/cases" className="block group">
          <Card className="cursor-pointer transition-all duration-200 hover:border-navy-900">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-navy-900 group-hover:bg-blue-900 group-hover:text-white transition-colors">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Cases
                </span>
                <div className="text-2xl font-extrabold text-red-900 mt-0.5">
                  {cases.length}
                </div>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/cases" className="block group">
          <Card className="cursor-pointer transition-all duration-200 hover:border-navy-900">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-navy-900 group-hover:bg-navy-900 group-hover:text-white transition-colors">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Active Cases
                </span>
                <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  {activeCases}
                </div>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/cases" className="block group">
          <Card className="cursor-pointer transition-all duration-200 hover:border-navy-900">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-navy-900 group-hover:bg-navy-900 group-hover:text-white transition-colors">
                <Network className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  EVM Cases
                </span>
                <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  {evmCases}
                </div>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/settings" className="block group">
          <Card className="cursor-pointer transition-all duration-200 hover:border-navy-900">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  System Engine
                </span>
                <div className="text-lg font-extrabold text-emerald-700 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  Operational
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Main Grid: Recent Activity & Platform Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle subtitle="Real-time intake and analyzed cases">
                Recent Investigations
              </CardTitle>
              <Link href="/cases">
                <Button variant="ghost" size="sm" className="text-navy-900 hover:text-navy-800 font-bold">
                  View All Cases
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>

            {recentCases.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No investigations recorded yet. Start by tracing a wallet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentCases.map((item) => (
                  <Link
                    key={item.case_id}
                    href={`/investigate?caseId=${encodeURIComponent(item.case_id)}`}
                    className="py-3.5 px-2 flex items-center justify-between gap-4 hover:bg-slate-50 rounded-lg transition-colors group block"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-navy-900 group-hover:bg-navy-900 group-hover:text-white transition-colors shrink-0">
                        <Database className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-900 group-hover:text-navy-900 transition-colors flex items-center gap-2 truncate">
                          {item.case_id}
                          {item.fraud_type && (
                            <span className="text-xs text-slate-500 font-normal hidden sm:inline">
                              • {item.fraud_type}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-mono truncate">
                          {shortAddress(item.wallet_address, 10, 8)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <RiskBadge risk={item.risk_level} />
                      <StatusBadge status={item.status} />
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-navy-900 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Platform Status */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle subtitle="Component readiness check">
                Platform Architecture
              </CardTitle>
              <Zap className="w-4 h-4 text-navy-900" />
            </CardHeader>

            <div className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  FastAPI Backend
                </div>
                <span className="font-mono text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Operational
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  PostgreSQL DB
                </div>
                <span className="font-mono text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Connected
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Blockchain Tracing
                </div>
                <span className="font-mono text-xs text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  EVM 2-Hop Active
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Risk Engine
                </div>
                <span className="font-mono text-xs text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Automated
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="text-slate-500 font-medium">Analyzed Cases</div>
                <span className="font-mono text-xs text-slate-900 font-bold">
                  {analyzedCases} of {cases.length}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link href="/settings" className="w-full block">
                <Button variant="outline" size="sm" className="w-full justify-between">
                  Open System Settings
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
