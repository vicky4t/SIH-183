"use client";

import React, { useMemo, useState } from "react";
import {
  Boxes,
  Check,
  Copy,
  ExternalLink,
  Layers,
  Network,
  Search,
  ShieldAlert,
  Info,
  TrendingUp,
  Target,
} from "lucide-react";
import { WalletCluster, ClusterMember } from "@/app/types";
import { shortAddress } from "@/app/lib/formatters";

interface WalletClusterIntelligenceProps {
  cluster?: WalletCluster | null;
  clusterId?: string;
  clusterSize?: number;
  clusterType?: string;
  confidence?: string | number;
  rootWallet?: string;
  wallets?: string[];
  members?: ClusterMember[];
  reasons?: string[];
  disclaimer?: string;
  selectedWallet?: { fullAddress: string; level: number } | null;
  onSelectWallet?: (wallet: string) => void;
}

export function WalletClusterIntelligence({
  cluster,
  clusterId: propClusterId,
  clusterSize: propClusterSize,
  clusterType: propClusterType,
  confidence: propConfidence,
  rootWallet: propRootWallet,
  wallets: propWallets,
  members: propMembers,
  reasons: propReasons,
  disclaimer: propDisclaimer,
  selectedWallet,
  onSelectWallet,
}: WalletClusterIntelligenceProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Normalize data from cluster object or individual props
  const clusterFound =
    cluster?.cluster_found !== undefined
      ? Boolean(cluster.cluster_found)
      : Boolean(cluster || propClusterId);

  const clusterId =
    propClusterId || cluster?.cluster_id || "CLUSTER-UNKNOWN";

  const clusterTypeRaw =
    propClusterType || cluster?.cluster_type || "Co-spending / Consolidation";

  const clusterType = clusterTypeRaw.replace(/_/g, " ");

  const rootWallet =
    propRootWallet || cluster?.root_wallet || "";

  const rawConfidence =
    propConfidence !== undefined
      ? propConfidence
      : cluster?.confidence !== undefined
      ? cluster.confidence
      : "HIGH";

  const members: ClusterMember[] = useMemo(
    () => propMembers || cluster?.members || [],
    [propMembers, cluster?.members]
  );

  const rawWallets: string[] = useMemo(
    () => propWallets || cluster?.wallets || [],
    [propWallets, cluster?.wallets]
  );

  // Associated wallets (excluding root)
  const rootAddrLower = rootWallet.toLowerCase();
  const associatedWallets: string[] = useMemo(() => {
    if (members.length > 0) {
      return members
        .map((m) => m.wallet)
        .filter((w) => w.toLowerCase() !== rootAddrLower);
    }
    return rawWallets.filter((w) => w.toLowerCase() !== rootAddrLower);
  }, [members, rawWallets, rootAddrLower]);

  const clusterSize =
    propClusterSize !== undefined
      ? propClusterSize
      : cluster?.cluster_size !== undefined
      ? cluster.cluster_size
      : (rootWallet ? 1 : 0) + associatedWallets.length;

  const reasons: string[] =
    propReasons || cluster?.reasons || [];

  const disclaimer =
    propDisclaimer ||
    cluster?.disclaimer ||
    "Forensic Disclaimer: Heuristic clustering is probabilistic and indicates transaction relationships only; it does not constitute definitive proof of common beneficial ownership. Findings should be corroborated with exchange KYC records, IP telemetry, and legal requisitions.";

  // Format confidence display and status color
  const confidenceStr = String(rawConfidence).trim();
  const isConfidenceNumeric = !isNaN(Number(confidenceStr.replace("%", "")));
  const confidenceScoreNum = isConfidenceNumeric
    ? Number(confidenceStr.replace("%", ""))
    : confidenceStr.toUpperCase() === "HIGH"
    ? 90
    : confidenceStr.toUpperCase() === "MEDIUM"
    ? 65
    : 35;

  const confidenceDisplay = isConfidenceNumeric
    ? `${confidenceScoreNum}%`
    : `${confidenceStr.toUpperCase()} (${confidenceScoreNum}%)`;

  const confidenceBadgeStyle =
    confidenceScoreNum >= 75
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : confidenceScoreNum >= 50
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : "bg-slate-100 text-slate-700 border-slate-200";

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

  // Filter associated wallets by search query
  const filteredWallets = useMemo(() => {
    if (!searchQuery) return associatedWallets;
    const q = searchQuery.toLowerCase();
    return associatedWallets.filter((addr) => {
      const matchAddr = addr.toLowerCase().includes(q);
      const member = members.find((m) => m.wallet.toLowerCase() === addr.toLowerCase());
      const matchReason = member?.reasons.some((r) => r.toLowerCase().includes(q));
      return matchAddr || matchReason;
    });
  }, [associatedWallets, searchQuery, members]);

  // Selected wallet cross-referencing
  const selectedAddrLower = selectedWallet?.fullAddress?.toLowerCase() || "";
  const isSelectedRoot = Boolean(rootWallet) && selectedAddrLower === rootAddrLower;
  const selectedMember = members.find(
    (m) => m.wallet.toLowerCase() === selectedAddrLower
  );
  const isSelectedAssociated = associatedWallets.some(
    (w) => w.toLowerCase() === selectedAddrLower
  );

  return (
    <div className="bg-white rounded-[14px] border border-[#d4e2ee] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-200">
      {/* 3px gradient accent bar at the very top (blue to cyan) */}
      <div className="h-[3px] w-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 rounded-t-[14px]" />

      {/* Card Header */}
      <div className="p-5 pb-4 border-b border-[#d4e2ee]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0 mt-0.5 shadow-2xs">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-wider text-blue-900 uppercase">
                BEHAVIORAL ENTITY GROUPING
              </span>
            </div>
            <h3 className="text-base font-bold text-[#0f172a] tracking-tight">
              Wallet Cluster Intelligence
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Heuristic clustering based on direct counterparties, shared transaction destinations, and multi-hop fund-flow proximity.
            </p>
          </div>
        </div>

        {/* Top-Right Pill-Shaped Badge displaying Cluster ID */}
        <div className="self-start sm:self-center shrink-0">
          {clusterFound ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
              <Boxes className="w-3.5 h-3.5 text-amber-700" />
              {clusterId}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              No Cluster Identified
            </span>
          )}
        </div>
      </div>

      {/* Card Content - Auto-expanding, No fixed height */}
      <div className="p-5 space-y-6">
        {/* Dynamic Selected Graph Node Callout */}
        {selectedWallet && (
          <div
            className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
              isSelectedRoot
                ? "bg-rose-50/80 border-rose-200 text-rose-950"
                : isSelectedAssociated
                ? "bg-blue-50/80 border-blue-200 text-blue-950"
                : "bg-slate-50/80 border-slate-200 text-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5" />
                Active Node: {shortAddress(selectedWallet.fullAddress, 8, 6)}
              </span>
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-white border border-current">
                {isSelectedRoot
                  ? "ROOT TARGET (SEED)"
                  : isSelectedAssociated
                  ? `CLUSTER MEMBER ${selectedMember ? `(SCORE: ${selectedMember.score})` : ""}`
                  : "EXTERNAL NODE"}
              </span>
            </div>

            {isSelectedRoot ? (
              <p className="text-[11px] text-rose-800 leading-relaxed">
                Investigated suspect wallet around which this behavioral cluster was established.
              </p>
            ) : isSelectedAssociated ? (
              <div className="space-y-1 pt-1">
                <div className="text-[11px] font-semibold text-blue-900">
                  Behavioral heuristics flagged for this node:
                </div>
                <div className="flex flex-wrap gap-1">
                  {(selectedMember?.reasons || ["Shared downstream transaction path"]).map((r, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-blue-200 text-blue-900 font-medium"
                    >
                      • {r}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                Selected node is present in the transaction graph but did not meet the behavioral correlation threshold to be included in this cluster.
              </p>
            )}
          </div>
        )}

        {clusterFound ? (
          <>
            {/* 1. Key Metrics Bar (4-item stat row) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50/80 border border-[#d4e2ee] rounded-xl shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">
                  Cluster Identifier
                </span>
                <div className="font-extrabold text-[#0f172a] text-sm mt-1 font-mono truncate">
                  {clusterId}
                </div>
                <span className="text-[11px] text-blue-700 font-mono font-medium">
                  Assigned Entity Tag
                </span>
              </div>

              <div className="p-3.5 bg-slate-50/80 border border-[#d4e2ee] rounded-xl shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">
                  Total Linked Wallets
                </span>
                <div className="font-extrabold text-[#0f172a] text-sm mt-1 font-mono">
                  {clusterSize} Wallets
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {associatedWallets.length} Associated Peers
                </span>
              </div>

              <div className="p-3.5 bg-slate-50/80 border border-[#d4e2ee] rounded-xl shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">
                  Cluster Type
                </span>
                <div className="font-extrabold text-[#0f172a] text-sm mt-1 truncate">
                  {clusterType}
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  Heuristic Grouping
                </span>
              </div>

              <div className="p-3.5 bg-slate-50/80 border border-[#d4e2ee] rounded-xl shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">
                  Confidence Score
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${confidenceBadgeStyle}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {confidenceDisplay}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                  Multi-Factor Probability
                </span>
              </div>
            </div>

            {/* 2. Root Suspect Wallet Section */}
            {rootWallet && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-rose-600" />
                    <span className="font-bold text-slate-800 uppercase tracking-wider">
                      Root Suspect Target Wallet
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-50 text-rose-700 border border-rose-200">
                    Primary Target
                  </span>
                </div>

                <div
                  onClick={() => onSelectWallet?.(rootWallet)}
                  className={`p-4 bg-rose-50/50 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all hover:bg-rose-50 ${
                    isSelectedRoot ? "ring-2 ring-rose-600 shadow-sm" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        Root Target
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        Investigated Seed Wallet
                      </span>
                    </div>
                    <div className="font-mono text-xs font-bold text-[#0f172a] break-all select-all">
                      {rootWallet}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(rootWallet);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs"
                      title="Copy Address"
                    >
                      {copiedAddress === rootWallet ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`https://etherscan.io/address/${rootWallet}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs"
                      title="View on Etherscan"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Explorer
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Clustered Wallets List (Auto-expanding, No fixed height cutoff) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
                    Associated Clustered Wallets ({associatedWallets.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Wallets algorithmically linked to the same entity via co-spending, gas funding, or direct consolidation.
                  </p>
                </div>

                {associatedWallets.length > 3 && (
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter cluster wallets..."
                      className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                )}
              </div>

              {/* Natural auto-expanding list without fixed height */}
              {associatedWallets.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-[#d4e2ee] rounded-xl text-center text-xs text-slate-500 font-mono">
                  No additional clustered wallets detected outside the root suspect target.
                </div>
              ) : filteredWallets.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-[#d4e2ee] rounded-xl text-center text-xs text-slate-500 font-mono">
                  No cluster wallets match &quot;{searchQuery}&quot;.
                </div>
              ) : (
                <div className="border border-[#d4e2ee] rounded-xl overflow-hidden shadow-2xs bg-white">
                  <div className="max-h-[340px] overflow-y-auto overscroll-contain divide-y divide-[#d4e2ee]/70">
                    {filteredWallets.map((wallet: string, idx: number) => {
                    const isSelected =
                      selectedAddrLower === wallet.toLowerCase();
                    const memberData = members.find(
                      (m) => m.wallet.toLowerCase() === wallet.toLowerCase()
                    );
                    const score = memberData?.score;
                    const walletReasons = memberData?.reasons || [];

                    return (
                      <div
                        key={`${wallet}-${idx}`}
                        onClick={() => onSelectWallet?.(wallet)}
                        className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50/90 hover:bg-blue-100/70"
                            : "hover:bg-slate-50/80"
                        }`}
                      >
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400 font-bold">
                              #{idx + 1}
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                              Associated Peer
                            </span>
                            {score !== undefined && (
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded-full border ${
                                  score >= 4
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : "bg-slate-100 text-slate-700 border-slate-200"
                                }`}
                              >
                                Link Score: {score}
                              </span>
                            )}
                          </div>

                          <div className="font-mono text-xs font-semibold text-[#0f172a] break-all select-all">
                            {wallet}
                          </div>

                          {walletReasons.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {walletReasons.map((r, rIdx) => (
                                <span
                                  key={rIdx}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                                >
                                  • {r}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(wallet);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-2xs"
                            title="Copy Address"
                          >
                            {copiedAddress === wallet ? (
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
                            href={`https://etherscan.io/address/${wallet}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shadow-2xs"
                            title="View on Etherscan"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Heuristics Triggered */}
            {reasons.length > 0 && (
              <div className="p-4 bg-slate-50/80 border border-[#d4e2ee] rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 font-mono font-bold text-slate-800 text-xs uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-blue-700" />
                  Triggered Behavioral Clustering Heuristics ({reasons.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {reasons.map((reason: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white border border-[#d4e2ee] flex items-start gap-2 text-xs text-slate-800 shadow-2xs"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                      <span className="font-mono text-[11px] leading-tight">
                        {reason}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Forensic Disclaimer Footer */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold font-mono uppercase text-[10px] tracking-wider text-amber-900 block">
                  Forensic Clustering Disclaimer
                </span>
                <p className="text-[11px] leading-relaxed text-amber-900/90">
                  {disclaimer}
                </p>
              </div>
            </div>
          </>
        ) : (
          /* 6. Empty State: No Cluster Identified */
          <div className="py-10 px-6 bg-slate-50/70 border border-dashed border-[#d4e2ee] rounded-xl text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[#0f172a] text-sm">
                No Behavioral Cluster Identified
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                Counterparty wallets in this transaction trace did not exhibit repeated co-spending,
                shared gas funding, or immediate consolidation patterns required to satisfy entity grouping thresholds.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-mono">
              <Boxes className="w-3.5 h-3.5" />
              Independent unlinked counterparties observed
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
