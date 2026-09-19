"use client";

import React, { useState } from "react";
import {
  Building2,
  ArrowDown,
  Check,
  Copy,
  ExternalLink,
  HelpCircle,
  Network,
  Landmark,
  Scale,
  Zap,
} from "lucide-react";
import { AnalysisData, VaspMatch, NearestVasp } from "@/app/types";
import { shortAddress } from "@/app/lib/formatters";

interface VaspAttributionProps {
  analysisData?: AnalysisData | null;
  exchangeMatches?: VaspMatch[];
  nearestVasp?: NearestVasp | null;
  defaultChain?: string;
  selectedWallet?: { fullAddress: string; level: number } | null;
  onSelectWallet?: (wallet: string) => void;
}

export function VaspAttribution({
  analysisData,
  exchangeMatches: propExchangeMatches,
  nearestVasp: propNearestVasp,
  defaultChain = "EVM",
  selectedWallet,
  onSelectWallet,
}: VaspAttributionProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Extract from analysisData or direct props
  const directMatches: VaspMatch[] =
    propExchangeMatches || analysisData?.exchange_matches || [];
  const nearestVaspData: NearestVasp | null | undefined =
    propNearestVasp !== undefined
      ? propNearestVasp
      : analysisData?.nearest_vasp;

  const vaspFound = Boolean(nearestVaspData?.vasp_found);
  const directMatchCount = directMatches.length;
  const hasDirectMatch = directMatchCount > 0;
  const isVaspIdentified = hasDirectMatch || vaspFound;

  const nearestMatch = nearestVaspData?.nearest_vasp;
  const hopDistance = nearestVaspData?.hop_distance ?? 1;
  const flowPath = nearestVaspData?.path || [];

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  // Selected wallet cross-referencing
  const selectedAddrLower = selectedWallet?.fullAddress?.toLowerCase() || "";
  const isSelectedDirectMatch = directMatches.some(
    (m) => m.matched_address?.toLowerCase() === selectedAddrLower
  );
  const isSelectedNearestEndpoint =
    Boolean(nearestMatch?.matched_address) &&
    nearestMatch?.matched_address?.toLowerCase() === selectedAddrLower;
  const selectedPathIndex = flowPath.findIndex(
    (p) => p.toLowerCase() === selectedAddrLower
  );

  return (
    <div className="bg-white rounded-[14px] border border-[#d4e2ee] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-200">
      {/* 3px gradient accent bar at the very top (blue to cyan) */}
      <div className="h-[3px] w-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 rounded-t-[14px]" />

      {/* Card Header */}
      <div className="p-4 pb-3 border-b border-[#d4e2ee]/60 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0 shadow-2xs">
              <Landmark className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] font-mono font-bold tracking-wider text-blue-900 uppercase leading-none mb-0.5">
                CYBER-FORENSIC ATTRIBUTION
              </div>
              <h3 className="text-sm font-bold text-[#0f172a] tracking-tight truncate">
                Exchange / VASP Attribution
              </h3>
            </div>
          </div>

          <div className="shrink-0">
            {isVaspIdentified ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                VASP Identified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                No Direct VASP
              </span>
            )}
          </div>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          Identify regulated centralized exchanges (CEX) and virtual asset service providers (VASP) in the flow of funds.
        </p>
      </div>

      {/* Card Content - Compact layout */}
      <div className="p-4 space-y-3.5">
        {/* Graph Node Selection Highlight Callout (if node is selected in graph) */}
        {selectedWallet && (
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-800 flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-blue-700" />
                Active Node: {shortAddress(selectedWallet.fullAddress, 8, 6)}
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                {selectedWallet.level === 0 ? "Suspect Root" : `Hop ${selectedWallet.level}`}
              </span>
            </div>

            {isSelectedDirectMatch ? (
              <div className="flex items-center gap-1.5 text-rose-700 font-semibold text-[11px]">
                <Zap className="w-3.5 h-3.5" />
                This selected wallet is directly attributed as a known exchange address!
              </div>
            ) : isSelectedNearestEndpoint ? (
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                <Check className="w-3.5 h-3.5" />
                This selected wallet is the identified destination Exchange / VASP endpoint!
              </div>
            ) : selectedPathIndex > 0 ? (
              <div className="flex items-center gap-1.5 text-blue-700 font-semibold text-[11px]">
                <ArrowDown className="w-3.5 h-3.5" />
                Step {selectedPathIndex + 1} of {flowPath.length} in the fund-flow path to the nearest VASP.
              </div>
            ) : (
              <div className="text-slate-500 text-[11px]">
                Address is currently unlinked to registered exchange repository records.
              </div>
            )}
          </div>
        )}

        {/* 1. Direct Exchange Matches */}
        {hasDirectMatch && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
                  Direct Suspect Exchange Matches ({directMatchCount})
                </h4>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200">
                Direct Attribution
              </span>
            </div>

            <div className="space-y-2.5">
              {directMatches.map((match: VaspMatch, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-white border border-rose-200 rounded-xl shadow-2xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-[#0f172a] text-sm">
                          {match.exchange || "Known Exchange / VASP"}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Entity Type: {match.type || "Centralized Exchange (CEX)"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        DIRECT MATCH
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {match.chain || defaultChain}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase font-mono text-slate-400 font-bold">
                        Attributed Hex Address
                      </div>
                      <div className="font-mono text-xs text-[#0f172a] font-semibold break-all select-all">
                        {match.matched_address}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => copyToClipboard(match.matched_address || "")}
                        title="Copy Address"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-2xs"
                      >
                        {copiedAddress === match.matched_address ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 text-[11px]">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Copy</span>
                          </>
                        )}
                      </button>
                      <a
                        href={`https://etherscan.io/address/${match.matched_address}`}
                        target="_blank"
                        rel="noreferrer"
                        title="View on Explorer"
                        className="p-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Nearest VASP Highlight Box */}
        {vaspFound && nearestMatch ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
                  Nearest Destination VASP Off-Ramp
                </h4>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {hopDistance === 1 ? "1 Hop Direct Off-Ramp" : `${hopDistance} Hops Traced`}
              </span>
            </div>

            {/* Prominent Highlight Box */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50/40 via-white to-cyan-50/30 border border-blue-200/90 shadow-2xs space-y-4">
              {/* Bold Exchange Name & Entity Tag */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-100/80">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white shadow-sm font-bold">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xl font-extrabold text-[#0f172a] tracking-tight">
                      {nearestMatch.exchange || "Verified VASP"}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      Identified Destination Custodial Service Provider
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100/80 text-blue-900 border border-blue-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    {nearestMatch.type || "CEX (Centralized Exchange)"}
                  </span>
                </div>
              </div>

              {/* 3-Column Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 2xl:grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-[#d4e2ee] rounded-xl shadow-2xs min-w-0">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">
                    Blockchain Network
                  </span>
                  <div className="font-extrabold text-[#0f172a] text-sm mt-1">
                    {nearestMatch.chain || defaultChain}
                  </div>
                  <span className="text-[11px] text-blue-700 font-mono">
                    Public Ledger
                  </span>
                </div>

                <div className="p-3 bg-white border border-[#d4e2ee] rounded-xl shadow-2xs min-w-0">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">
                    Hop Distance
                  </span>
                  <div className="font-extrabold text-[#0f172a] text-sm mt-1 font-mono">
                    {hopDistance === 1 ? "1 Hop Direct" : `${hopDistance} Hops Traced`}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-mono">
                    Downstream Off-Ramp
                  </span>
                </div>

                <div className="p-3 bg-white border border-[#d4e2ee] rounded-xl shadow-2xs min-w-0">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">
                    Match Type
                  </span>
                  <div className="font-bold text-[#0f172a] text-sm mt-1 truncate">
                    {nearestMatch.match_type
                      ? nearestMatch.match_type.replace(/_/g, " ")
                      : "Known Exchange Deposit"}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Verified Custodial Tag
                  </span>
                </div>
              </div>

              {/* Exact VASP Deposit Address Box */}
              <div className="p-3.5 bg-white border border-blue-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                    Identified VASP Deposit / Hot Wallet Address
                  </span>
                  <span className="text-emerald-700 font-bold">
                    Custodian Deposit Address
                  </span>
                </div>

                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-1">
                  <span className="font-mono text-xs text-[#0f172a] font-bold break-all select-all">
                    {nearestMatch.matched_address}
                  </span>

                  <div className="flex items-center gap-2 shrink-0 self-start xl:self-auto">
                    <button
                      onClick={() =>
                        copyToClipboard(nearestMatch.matched_address || "")
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      {copiedAddress === nearestMatch.matched_address ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Address</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`https://etherscan.io/address/${nearestMatch.matched_address}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Explorer
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Fund Flow Path Tracker */}
            {flowPath.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-slate-800 uppercase tracking-wider">
                    Fund Flow Path Tracker
                  </span>
                  <span className="text-slate-500">
                    {flowPath.length} Sequential Wallets in Trail
                  </span>
                </div>

                <div className="p-4 bg-slate-50/90 border border-[#d4e2ee] rounded-xl space-y-2">
                  {flowPath.map((wallet: string, index: number) => {
                    const isRoot = index === 0;
                    const isDestination = index === flowPath.length - 1;
                    const isCurrentSelected =
                      selectedAddrLower === wallet.toLowerCase();

                    return (
                      <React.Fragment key={`${wallet}-${index}`}>
                        <div
                          onClick={() => onSelectWallet?.(wallet)}
                          className={`p-3 rounded-lg flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 font-mono text-xs cursor-pointer transition-all border ${
                            isCurrentSelected
                              ? "ring-2 ring-blue-600 shadow-sm"
                              : ""
                          } ${
                            isRoot
                              ? "bg-rose-50/90 border-rose-200 text-rose-950"
                              : isDestination
                              ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs"
                              : "bg-white border-slate-200 text-slate-800 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                                isRoot
                                  ? "bg-rose-200/80 text-rose-900 border border-rose-300"
                                  : isDestination
                                  ? "bg-emerald-200 text-emerald-900 border border-emerald-300"
                                  : "bg-blue-50 text-blue-800 border border-blue-200"
                              }`}
                            >
                              {isRoot
                                ? "Suspect Wallet (Origin)"
                                : isDestination
                                ? `Destination VASP • ${nearestMatch.exchange || "VASP"}`
                                : `Hop ${index} • Intermediary`}
                            </span>
                            <span className="text-xs break-all font-mono font-semibold">
                              {wallet}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end xl:self-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(wallet);
                              }}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500"
                              title="Copy Address"
                            >
                              {copiedAddress === wallet ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <span className="text-[11px] text-slate-400 hidden md:inline">
                              {isDestination
                                ? "Final Deposit Endpoint"
                                : "Click to select"}
                            </span>
                          </div>
                        </div>

                        {!isDestination && (
                          <div className="flex justify-center text-blue-600 py-0.5">
                            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                              <ArrowDown className="w-4 h-4 text-blue-600" />
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Legal / Law Enforcement Advisory */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/90 text-amber-950 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <Scale className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-mono text-xs uppercase tracking-wider">
                  Law Enforcement Advisory — Section 91 CrPC / MLAT Requisition
                </span>
              </div>
              <p className="text-slate-800 leading-relaxed">
                Cryptocurrency off-ramp identified at{" "}
                <strong className="text-slate-950 font-bold">
                  {nearestMatch.exchange}
                </strong>{" "}
                (Hop Distance: {hopDistance}). Under{" "}
                <strong className="text-amber-950 font-semibold">
                  Section 91 CrPC / MLAT / FIU-IND
                </strong>{" "}
                procedures, an immediate statutory notice should be served to the
                designated Law Enforcement Liaison Desk of{" "}
                <strong className="text-slate-950 font-bold">
                  {nearestMatch.exchange}
                </strong>{" "}
                to request:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-700 font-medium pl-1">
                <li>Immediate administrative freeze on the beneficiary account.</li>
                <li>Full KYC records (Government ID, selfie, proof of address, registered phone &amp; email).</li>
                <li>Fiat off-ramp banking details (Bank Account number, IFSC, UPI ID).</li>
                <li>IP login audit logs, device fingerprints, and withdrawal session timestamps.</li>
              </ul>
            </div>
          </div>
        ) : !hasDirectMatch ? (
          /* 5. Empty State: No VASP Found */
          <div className="py-4 px-4 bg-slate-50/70 border border-dashed border-[#d4e2ee] rounded-xl text-center space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-[#0f172a] text-xs">
                No Direct Exchange / VASP Endpoint Identified
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Within the analyzed multi-hop transaction horizon, funds currently
                reside in unhosted private wallets or unverified smart contracts.
                No recognized centralized exchange deposit or hot wallet matched
                the known VASP directory.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono">
              <HelpCircle className="w-3 h-3" />
              Funds in unhosted custody • Monitoring advised
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
