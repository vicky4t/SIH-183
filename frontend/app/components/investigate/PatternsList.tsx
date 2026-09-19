import React from "react";
import { Activity, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { PatternFinding } from "@/app/types";
import { shortAddress } from "@/app/lib/formatters";

interface PatternsListProps {
  findings?: PatternFinding[];
}

export function PatternsList({ findings = [] }: PatternsListProps) {
  const patternSummary = React.useMemo(() => {
    const grouped = new Map<
      string,
      { pattern: string; count: number; sampleWallet: string | null }
    >();

    findings.forEach((finding) => {
      const pattern = finding?.pattern || "Suspicious Transaction Pattern";
      const existing = grouped.get(pattern) || {
        pattern,
        count: 0,
        sampleWallet: null,
      };

      existing.count += 1;
      if (!existing.sampleWallet && finding?.wallet) {
        existing.sampleWallet = finding.wallet;
      }

      grouped.set(pattern, existing);
    });

    return Array.from(grouped.values());
  }, [findings]);

  return (
    <Card>
      <CardHeader>
        <CardTitle subtitle="Unique forensic transaction behavior types">
          Detected Patterns
        </CardTitle>
        <Activity className="w-4 h-4 text-navy-900" />
      </CardHeader>

      {patternSummary.length > 0 ? (
        <div className="space-y-2.5">
          {patternSummary.map((item) => (
            <div
              key={item.pattern}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-xs"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>{item.pattern}</span>
                  <span className="text-[10px] font-mono bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                    {item.count} {item.count === 1 ? "finding" : "findings"}
                  </span>
                </div>

                {item.sampleWallet && (
                  <div className="text-[11px] font-mono text-slate-600 mt-1 font-medium">
                    Sample: {shortAddress(item.sampleWallet, 8, 6)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-slate-500 text-xs">
          {findings.length === 0
            ? "No suspicious patterns detected or investigation pending."
            : "No transaction patterns flagged."}
        </div>
      )}
    </Card>
  );
}
