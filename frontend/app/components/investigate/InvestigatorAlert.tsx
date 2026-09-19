import React from "react";
import { Bell, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { AlertData } from "@/app/types";
import { formatDate } from "@/app/lib/formatters";

interface InvestigatorAlertProps {
  alert?: AlertData | null;
}

export function InvestigatorAlert({ alert }: InvestigatorAlertProps) {
  if (!alert) {
    return (
      <Card>
        <CardHeader>
          <CardTitle subtitle="Generated automatically by intelligence rules">
            Investigator Alert
          </CardTitle>
          <Bell className="w-4 h-4 text-navy-900" />
        </CardHeader>
        <div className="py-6 text-center text-slate-500 text-xs">
          Investigation alert generation pending.
        </div>
      </Card>
    );
  }

  const isHigh =
    alert.severity === "CRITICAL" ||
    alert.severity === "HIGH" ||
    alert.risk_level === "HIGH";

  return (
    <Card className={isHigh ? "border-rose-300" : ""}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle subtitle="Generated automatically by intelligence rules">
            Investigator Alert
          </CardTitle>
        </div>
        <span
          className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
            isHigh
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          {alert.severity || "ALERT"}
        </span>
      </CardHeader>

      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
          <span className="text-slate-500 font-medium">Alert Type</span>
          <strong className="text-slate-900 font-bold">
            {alert.alert_type || "Risk Anomaly"}
          </strong>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
          <span className="text-slate-500 font-medium">Threat Score</span>
          <strong className="text-rose-600 font-mono font-bold">
            {alert.risk_score !== undefined ? `${alert.risk_score}/100` : "—"}
          </strong>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
          <span className="text-slate-500 font-medium">Generated Timestamp</span>
          <span className="text-slate-700 font-mono">
            {formatDate(alert.generated_at)}
          </span>
        </div>

        {alert.reasons && alert.reasons.length > 0 && (
          <div className="pt-2 space-y-1.5">
            <div className="text-[11px] font-mono text-slate-700 uppercase font-bold">
              Alert Trigger Factors
            </div>
            {alert.reasons.map((r: string, i: number) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
              >
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
