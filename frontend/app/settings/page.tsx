import React from "react";
import {
  CheckCircle2,
  Database,
  Network,
  Server,
  Shield,
  XCircle,
} from "lucide-react";
import { API_BASE, getHealth } from "@/app/lib/api";
import { HealthResponse } from "@/app/types";
import { Card, CardHeader, CardTitle } from "@/app/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let health: HealthResponse | null = null;
  try {
    health = await getHealth();
  } catch (err) {
    console.error("Health check fetch error:", err);
    health = null;
  }

  const isHealthy = health?.status === "healthy";

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold tracking-widest text-navy-900 uppercase font-mono mb-1">
            SYSTEM DIAGNOSTICS & CONFIGURATION
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Platform Settings
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Backend connectivity, database health, and intelligence pipeline configuration.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className={`border ${
            isHealthy
              ? "border-emerald-200 bg-emerald-50/30"
              : "border-rose-200 bg-rose-50/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-navy-900">
              <Server className="w-5 h-5" />
            </div>
            {isHealthy ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600" />
            )}
          </div>
          <div className="mt-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              FastAPI Engine
            </div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              {isHealthy ? "Operational" : "Offline"}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-navy-900">
              <Database className="w-5 h-5" />
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Case Database
            </div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              PostgreSQL
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-navy-900">
              <Network className="w-5 h-5" />
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Blockchain Pipeline
            </div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              EVM Tracing
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-navy-900">
              <Shield className="w-5 h-5" />
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Analysis Engine
            </div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              Rules Active
            </div>
          </div>
        </Card>
      </div>

      {/* API Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle subtitle="Configured endpoint parameters and limits">
            ShadowTrace API Configuration
          </CardTitle>
          <span className="text-xs font-mono font-bold text-navy-900">v2.0.0-Next.js</span>
        </CardHeader>

        <div className="divide-y divide-slate-100 text-xs font-mono">
          <div className="flex items-center justify-between py-3">
            <span className="text-slate-600 font-sans font-medium">API Base URL</span>
            <strong className="text-navy-900 font-bold">{API_BASE}</strong>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-slate-600 font-sans font-medium">Health Check Endpoint</span>
            <span className="text-slate-800 font-medium">/health</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-slate-600 font-sans font-medium">Case Intake & List API</span>
            <span className="text-slate-800 font-medium">/api/cases/</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-slate-600 font-sans font-medium">Trace Intelligence API</span>
            <span className="text-slate-800 font-medium">/api/cases/{`{case_id}`}/trace</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-slate-600 font-sans font-medium">Risk Analysis Engine API</span>
            <span className="text-slate-800 font-medium">/api/cases/{`{case_id}`}/analyze</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-slate-600 font-sans font-medium">PDF Report Generation API</span>
            <span className="text-slate-800 font-medium">/api/reports/{`{case_id}`}/pdf</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-slate-600 font-sans font-medium">Max Trace Depth</span>
            <span className="text-emerald-700 font-bold">2 Hops (Configured)</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
