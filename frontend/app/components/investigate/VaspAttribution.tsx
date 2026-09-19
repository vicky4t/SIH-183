import React from "react";
import { Building2, ArrowDown, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { AnalysisData, VaspMatch } from "@/app/types";
import { shortAddress } from "@/app/lib/formatters";

interface VaspAttributionProps {
  analysisData: AnalysisData | null;
  defaultChain?: string;
}

export function VaspAttribution({
  analysisData,
  defaultChain = "EVM",
}: VaspAttributionProps) {
  if (!analysisData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle subtitle="Direct match and nearest traced endpoint">
            Exchange / VASP Attribution
          </CardTitle>
          <Building2 className="w-4 h-4 text-navy-900" />
        </CardHeader>
        <div className="py-8 text-center text-slate-500 text-xs">
          Run an investigation to view exchange attribution results.
        </div>
      </Card>
    );
  }

  const { exchange_matches = [], nearest_vasp } = analysisData;
  const vaspFound = nearest_vasp?.vasp_found;
  const path = nearest_vasp?.path || [];

  return (
    <Card>
      <CardHeader>
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-navy-900 uppercase">
            FUND ATTRIBUTION
          </span>
          <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
            Exchange / VASP Attribution
          </h3>
        </div>
        <span
          className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
            vaspFound
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          {vaspFound ? "VASP IDENTIFIED" : "NO VASP MATCH"}
        </span>
      </CardHeader>

      <div className="space-y-4 text-xs">
        {/* Direct Wallet Match */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <span className="text-slate-600 font-medium">Direct Wallet Match</span>
          <span className="font-mono font-bold text-slate-900">
            {exchange_matches.length > 0
              ? `${exchange_matches.length} MATCHED`
              : "No direct match"}
          </span>
        </div>

        {/* Direct matches list if any */}
        {exchange_matches.length > 0 && (
          <div className="space-y-2">
            {exchange_matches.map((match: VaspMatch, idx: number) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-navy-900 font-bold">
                    {match.exchange || "Known Exchange"}
                  </strong>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded border border-blue-200">
                    {match.type || "VASP"}
                  </span>
                </div>
                <div className="font-mono text-slate-600 text-[11px] truncate">
                  {match.matched_address}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nearest VASP Details */}
        {vaspFound && nearest_vasp ? (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase font-mono">
                  Exchange / VASP
                </span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {nearest_vasp.nearest_vasp?.exchange || "Unknown"}
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase font-mono">
                  Entity Type
                </span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {nearest_vasp.nearest_vasp?.type || "VASP"}
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase font-mono">
                  Blockchain
                </span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {nearest_vasp.nearest_vasp?.chain || defaultChain}
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase font-mono">
                  Hop Distance
                </span>
                <div className="font-bold text-navy-900 text-sm mt-0.5 font-mono">
                  {nearest_vasp.hop_distance}{" "}
                  {nearest_vasp.hop_distance === 1 ? "Hop" : "Hops"}
                </div>
              </div>
            </div>

            {/* Matched Address Info */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-mono">
                Matched Exchange Address
              </div>
              <div className="font-mono text-xs text-emerald-800 break-all font-bold">
                {nearest_vasp.nearest_vasp?.matched_address}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Match Type:{" "}
                {nearest_vasp.nearest_vasp?.match_type ||
                  "KNOWN_EXCHANGE_ADDRESS"}
              </div>
            </div>

            {/* Fund Flow Path chain */}
            {path.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-mono font-bold text-slate-800 uppercase">
                  Traced Fund Flow Path
                </div>
                <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {path.map((wallet: string, index: number) => {
                    const isRoot = index === 0;
                    const isExchange = index === path.length - 1;

                    return (
                      <React.Fragment key={`${wallet}-${index}`}>
                        <div
                          className={`p-2.5 rounded-lg flex items-center justify-between font-mono text-xs ${
                            isRoot
                              ? "bg-rose-50 border border-rose-200 text-rose-800"
                              : isExchange
                              ? "bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold"
                              : "bg-white border border-slate-200 text-slate-800"
                          }`}
                        >
                          <span className="font-bold text-[10px] uppercase tracking-wider">
                            {isRoot
                              ? "1. Suspect"
                              : isExchange
                              ? `${index + 1}. VASP Endpoint`
                              : `${index + 1}. Intermediary`}
                          </span>
                          <span className="text-[11px]">
                            {shortAddress(wallet, 8, 6)}
                          </span>
                        </div>

                        {!isExchange && (
                          <div className="flex justify-center text-slate-400 py-0.5">
                            <ArrowDown className="w-3.5 h-3.5 text-navy-900" />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Investigator Recommendation */}
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                Investigator Recommendation
              </div>
              <p className="text-slate-700 text-xs leading-relaxed">
                Known Exchange / VASP endpoint identified in the outgoing fund flow. Preserve the traced transaction trail and initiate the corresponding legal information-preservation or freeze request with the identified exchange compliance desk.
              </p>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-slate-500 text-xs leading-relaxed">
            No address in the currently traced outgoing fund flow path matched the known Exchange/VASP dataset.
          </div>
        )}
      </div>
    </Card>
  );
}
