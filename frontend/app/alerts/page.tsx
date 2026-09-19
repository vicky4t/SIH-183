import React from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { getCases } from "@/app/lib/api";
import { Case } from "@/app/types";
import { Card, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { RiskBadge, ChainBadge, StatusBadge } from "@/app/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  let cases: Case[] = [];
  try {
    const data = await getCases();
    cases = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Alerts server fetch error:", err);
    cases = [];
  }

  const alerts = cases.filter((item) => {
    const risk = (item.risk_level || "UNKNOWN").toUpperCase();
    return ["HIGH", "MEDIUM", "LOW"].includes(risk);
  });

  const highCount = alerts.filter(
    (item) => item.risk_level?.toUpperCase() === "HIGH"
  ).length;

  const mediumCount = alerts.filter(
    (item) => item.risk_level?.toUpperCase() === "MEDIUM"
  ).length;

  const lowCount = alerts.filter(
    (item) => item.risk_level?.toUpperCase() === "LOW"
  ).length;

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold tracking-widest text-navy-900 uppercase font-mono mb-1">
            THREAT INTELLIGENCE
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Investigation Alerts
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Automated threat alerts generated from analyzed cryptocurrency investigation cases.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-rose-200 bg-rose-50/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                High Risk
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {highCount}
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-amber-200 bg-amber-50/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Medium Risk
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {mediumCount}
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Low Risk
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {lowCount}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-navy-900">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Alerts
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {alerts.length}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Alert Feed */}
      <Card>
        <CardHeader>
          <CardTitle subtitle="Real-time categorized risk detections">
            Threat Detection Feed
          </CardTitle>
          <span className="text-xs font-mono font-bold text-navy-900">
            {alerts.length} Active Threat Signals
          </span>
        </CardHeader>

        {alerts.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            No analyzed risk alerts available yet.
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((item) => {
              const risk = (item.risk_level || "UNKNOWN").toUpperCase();
              const isHigh = risk === "HIGH";

              return (
                <Link
                  key={item.case_id}
                  href={`/investigate?caseId=${encodeURIComponent(item.case_id)}`}
                  className={`p-4 rounded-xl border transition-all block flex flex-col sm:flex-row sm:items-center justify-between gap-4 group bg-white shadow-sm ${
                    isHigh
                      ? "border-rose-300 hover:border-rose-400"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isHigh
                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-slate-900 group-hover:text-navy-900 transition-colors">
                          {risk} Risk Investigation Alert
                        </strong>
                        <RiskBadge risk={risk} />
                      </div>

                      <div className="text-xs font-mono text-navy-900 font-bold mt-0.5">
                        {item.case_id}
                        {item.fraud_type && (
                          <span className="text-slate-500 font-normal font-sans ml-2">
                            • {item.fraud_type}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-1 truncate">
                        <Wallet className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.wallet_address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <ChainBadge chain={item.chain} />
                    <StatusBadge status={item.status} />
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-navy-900 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
