"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useNodesState, useEdgesState, Node, Edge } from "@xyflow/react";
import {
  Activity,
  AlertTriangle,
  Check,
  Copy,
  Database,
  ExternalLink,
  Network,
  Search,
  Shield,
  Wallet,
} from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { RiskBadge, StatusBadge } from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";
import { StatusBanner } from "@/app/components/ui/StatusBanner";
import { VaspAttribution } from "@/app/components/investigate/VaspAttribution";
import { WalletClusterIntelligence } from "@/app/components/investigate/WalletClusterIntelligence";
import { PatternsList } from "@/app/components/investigate/PatternsList";
import { InvestigatorAlert } from "@/app/components/investigate/InvestigatorAlert";

import { createCase, traceCase, analyzeCase, getCases } from "@/app/lib/api";
import { buildGraph, CustomNodeData } from "@/app/lib/graph";
import { Case, TraceGraph, AnalysisData, PatternFinding } from "@/app/types";

// Dynamic import with SSR disabled for ReactFlow canvas
const TransactionGraph = dynamic(
  () =>
    import("@/app/components/investigate/TransactionGraph").then(
      (mod) => mod.TransactionGraph
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[580px] bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 text-xs font-mono">
        Initializing Graph Canvas...
      </div>
    ),
  }
);

function InvestigateContent() {
  const searchParams = useSearchParams();
  const caseIdParam = searchParams?.get("caseId");

  const [walletAddress, setWalletAddress] = useState("");
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [traceData, setTraceData] = useState<TraceGraph | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<{
    fullAddress: string;
    level: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [graphMode, setGraphMode] = useState<"focused" | "full">("full");
  const [totalGraphStats, setTotalGraphStats] = useState({
    wallets: 0,
    edges: 0,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CustomNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const openExistingCaseById = useCallback(async (caseId: string) => {
    setLoading(true);
    setError("");
    setStatus(`Loading existing investigation ${caseId}...`);
    setSelectedWallet(null);
    setNodes([]);
    setEdges([]);
    setGraphMode("full");

    try {
      let matchedWallet = "";
      try {
        const cases = await getCases();
        const match = cases.find((c: Case) => c.case_id === caseId);
        if (match) {
          setCaseData(match);
          setWalletAddress(match.wallet_address);
          matchedWallet = match.wallet_address;
        }
      } catch (err: unknown) {
        console.warn("Could not pre-fetch cases list:", err);
      }

      setStatus(`Tracing blockchain transaction graph for ${caseId}...`);
      const traceResult = await traceCase(caseId);
      const trace = traceResult.trace;
      const rootWallet =
        traceResult.wallet_address ||
        matchedWallet ||
        trace?.root_wallet ||
        "";

      setTraceData(trace);

      setCaseData((current: Case | null) => ({
        ...(current || {}),
        case_id: traceResult.case_id || caseId,
        wallet_address: rootWallet,
        chain: traceResult.chain || current?.chain || "EVM",
        status: current?.status || "ANALYZED",
      }));
      setWalletAddress(rootWallet);

      // Build and immediately render the full graph with all nodes & connections
      const graphResult = buildGraph(trace, rootWallet, "full");
      setTotalGraphStats({
        wallets: graphResult.totalWallets,
        edges: graphResult.totalEdges,
      });
      setNodes(graphResult.nodes);
      setEdges(graphResult.edges);

      setStatus(`Loading threat intelligence for ${caseId}...`);
      try {
        const analyzed = await analyzeCase(caseId);
        setAnalysisData(analyzed.analysis);

        setCaseData((current: Case | null) => ({
          ...(current || {}),
          case_id: caseId,
          wallet_address: rootWallet || current?.wallet_address || "",
          status: analyzed.status,
          risk_level:
            analyzed.analysis?.risk?.risk_level ||
            current?.risk_level ||
            "UNKNOWN",
        }));

        const risk = analyzed.analysis?.risk?.risk_level || "UNKNOWN";
        const score = analyzed.analysis?.risk?.risk_score ?? 0;
        setStatus(
          `${caseId} loaded • ${graphResult.totalWallets} wallets traced • Threat Risk: ${risk} (${score}/100)`
        );
      } catch (analysisErr: unknown) {
        console.warn("Analysis pipeline warning:", analysisErr);
        setStatus(
          `${caseId} loaded • ${graphResult.totalWallets} wallets traced • Graph rendered`
        );
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load existing investigation.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges]);

  // Load existing case if caseId query parameter is provided
  useEffect(() => {
    if (caseIdParam) {
      void Promise.resolve().then(() => {
        openExistingCaseById(caseIdParam);
      });
    }
  }, [caseIdParam, openExistingCaseById]);

  const applyGraphView = useCallback(
    (trace: TraceGraph, rootWallet: string, mode: "focused" | "full") => {
      const result = buildGraph(trace, rootWallet, mode);
      setGraphMode(mode);
      setNodes(result.nodes);
      setEdges(result.edges);
      setTotalGraphStats({
        wallets: result.totalWallets,
        edges: result.totalEdges,
      });
    },
    [setNodes, setEdges]
  );

  const startInvestigation = async () => {
    const wallet = walletAddress.trim();
    if (!wallet) {
      setError("Please enter a suspect wallet address.");
      return;
    }

    setLoading(true);
    setError("");
    setCaseData(null);
    setTraceData(null);
    setAnalysisData(null);
    setNodes([]);
    setEdges([]);
    setSelectedWallet(null);
    setGraphMode("full");
    setTotalGraphStats({ wallets: 0, edges: 0 });

    try {
      setStatus("Validating suspect wallet address...");
      const created = await createCase(wallet);
      setCaseData(created);
      setWalletAddress(created.wallet_address);

      setStatus(`Opening ${created.case_id} • Starting blockchain trace...`);
      const traceResult = await traceCase(created.case_id);
      setTraceData(traceResult.trace);

      setStatus("Building full transaction intelligence graph...");
      const graphResult = buildGraph(
        traceResult.trace,
        created.wallet_address,
        "full"
      );

      setTotalGraphStats({
        wallets: graphResult.totalWallets,
        edges: graphResult.totalEdges,
      });

      // Render full graph immediately with all nodes & connections
      setNodes(graphResult.nodes);
      setEdges(graphResult.edges);

      setStatus(`Running fraud intelligence analysis for ${created.case_id}...`);
      try {
        const analyzed = await analyzeCase(created.case_id);
        setAnalysisData(analyzed.analysis);

        setCaseData((current: Case | null) => ({
          ...(current || {}),
          case_id: created.case_id,
          wallet_address: created.wallet_address,
          status: analyzed.status,
          risk_level: analyzed.analysis?.risk?.risk_level,
        }));

        const riskLevel = analyzed.analysis?.risk?.risk_level || "UNKNOWN";
        const riskScore = analyzed.analysis?.risk?.risk_score ?? 0;
        setStatus(
          `${created.case_id} investigation complete • ${graphResult.totalWallets} wallets traced • Risk ${riskLevel} (${riskScore}/100)`
        );
      } catch (analysisErr: unknown) {
        console.warn("Analysis pipeline warning:", analysisErr);
        setStatus(
          `${created.case_id} trace complete • ${graphResult.totalWallets} wallets rendered`
        );
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Investigation failed.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  const switchGraphMode = (mode: "focused" | "full") => {
    if (!traceData || !caseData?.wallet_address) return;
    setSelectedWallet(null);
    applyGraphView(traceData, caseData.wallet_address, mode);

    if (mode === "focused") {
      setStatus(`Focused view • Prioritizing critical suspect path (${totalGraphStats.wallets} total traced)`);
    } else {
      setStatus(
        `Full graph loaded • ${totalGraphStats.wallets} wallets • ${totalGraphStats.edges} connections`
      );
    }
  };

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<CustomNodeData>) => {
    setSelectedWallet({
      fullAddress: node.data.fullAddress,
      level: node.data.level,
    });
  }, []);

  const handleSelectWallet = useCallback(
    (address: string) => {
      const target = address.toLowerCase();
      const found = nodes.find(
        (n) => n.data.fullAddress.toLowerCase() === target
      );
      const isRoot = target === (caseData?.wallet_address || "").toLowerCase();
      setSelectedWallet({
        fullAddress: address,
        level: found?.data.level ?? (isRoot ? 0 : 1),
      });
    },
    [nodes, caseData]
  );

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e: unknown) {
      console.error(e);
    }
  };

  const patternCount = useMemo(() => {
    const findings = analysisData?.pattern_findings || [];
    const unique = new Set(findings.map((f: PatternFinding) => f.pattern));
    return unique.size;
  }, [analysisData]);

  const riskLevel = analysisData?.risk?.risk_level || caseData?.risk_level;
  const riskScore = analysisData?.risk?.risk_score;
  const reasons = analysisData?.risk?.reasons || [];

  return (
    <div className="space-y-6">
      {/* Wallet Search Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-navy-900 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Network className="w-3.5 h-3.5 text-navy-900" />
            REAL-TIME BLOCKCHAIN FORENSICS
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Trace a Suspect Wallet
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            Enter a victim-reported or flagged suspect wallet address. ShadowTrace validates the address, analyzes fund flow across multi-hop transactions, identifies exchange endpoints, and scores threat risk.
          </p>

          <div className="mt-5 space-y-2">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
              Suspect Wallet Address
            </label>

            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Wallet className="w-5 h-5 text-navy-900" />
                </div>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading) {
                      startInvestigation();
                    }
                  }}
                  placeholder="Enter Ethereum or supported EVM wallet address (0x...)"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 transition-all shadow-sm"
                />
              </div>

              <Button
                onClick={startInvestigation}
                loading={loading}
                variant="primary"
                size="lg"
                className="sm:px-6 tracking-wide font-bold shrink-0 bg-navy-900 hover:bg-navy-800 text-white"
                icon={<Search className="w-4 h-4" />}
              >
                {loading ? "ANALYZING..." : "TRACE WALLET"}
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
              <span>Chain Detection: Automatic (EVM)</span>
              <span>Trace Depth: 2 Hops (Standard)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && <StatusBanner type="error" message={error} />}
      {status && (
        <StatusBanner
          type={loading ? "loading" : "success"}
          message={status}
        />
      )}

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-navy-900 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Case ID
            </div>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
              {caseData?.case_id || "—"}
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-navy-900 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Blockchain
            </div>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
              {caseData?.chain || "—"}
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-navy-900 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Total Wallets
            </div>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
              {totalGraphStats.wallets}
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Threat Risk
            </div>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
              {riskLevel ? `${riskLevel} (${riskScore ?? 0}/100)` : "—"}
            </div>
          </div>
        </Card>
      </div>

      {/* Main Workspace: 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Transaction Graph & Attribution */}
        <div className="lg:col-span-2 space-y-6">
          <TransactionGraph
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            graphMode={graphMode}
            onSwitchGraphMode={switchGraphMode}
            totalWallets={totalGraphStats.wallets}
            totalEdges={totalGraphStats.edges}
            disabled={!traceData}
          />

          <WalletClusterIntelligence
            cluster={analysisData?.wallet_cluster}
            selectedWallet={selectedWallet}
            onSelectWallet={handleSelectWallet}
          />
        </div>

        {/* Right Column: Case Intelligence & Alert Panel */}
        <div className="space-y-6">
          {/* Case Intelligence Card */}
          <Card>
            <CardHeader>
              <CardTitle subtitle="Current forensic case analysis">
                Investigation Intelligence
              </CardTitle>
              <Shield className="w-4 h-4 text-navy-900" />
            </CardHeader>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600 font-medium">Case Identifier</span>
                <strong className="text-slate-900 font-mono font-bold">
                  {caseData?.case_id || "—"}
                </strong>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600 font-medium">Target Blockchain</span>
                <strong className="text-slate-900 font-mono">
                  {caseData?.chain || "—"}
                </strong>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600 font-medium">Status</span>
                <StatusBadge status={caseData?.status} />
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600 font-medium">Threat Level</span>
                <RiskBadge risk={riskLevel} />
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600 font-medium">Risk Score</span>
                <strong className="text-slate-900 font-mono font-bold">
                  {riskScore !== undefined ? `${riskScore}/100` : "—"}
                </strong>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600 font-medium">Detected Patterns</span>
                <strong className="text-navy-900 font-mono font-bold">
                  {patternCount} Unique
                </strong>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600 font-medium">Trace Depth</span>
                <strong className="text-slate-900 font-mono">
                  {traceData?.max_hops ?? 2} Hops
                </strong>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600 font-medium">Cluster Identifier</span>
                <strong className="text-navy-900 font-mono font-bold">
                  {analysisData?.wallet_cluster?.cluster_id || "—"}
                </strong>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600 font-medium">Attributed VASP</span>
                <strong className="text-slate-900 font-mono">
                  {analysisData?.nearest_vasp?.nearest_vasp?.exchange ||
                    (analysisData?.exchange_matches &&
                    analysisData.exchange_matches.length > 0
                      ? analysisData.exchange_matches[0].exchange
                      : "Unattributed")}
                </strong>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600 font-medium">Visible Wallets</span>
                <strong className="text-slate-900 font-mono">
                  {nodes.length} / {totalGraphStats.wallets}
                </strong>
              </div>
            </div>
          </Card>

          {/* Risk Assessment Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle subtitle="Indicators contributing to risk score">
                Risk Assessment
              </CardTitle>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </CardHeader>

            {reasons.length > 0 ? (
              <div className="space-y-2">
                {reasons.map((reason: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50/50 border border-amber-200 text-xs text-slate-800 leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-500 text-xs">
                {analysisData
                  ? "No additional high-risk indicators were flagged."
                  : "Execute an investigation to calculate threat risk factors."}
              </div>
            )}
          </Card>

          {/* Selected Wallet Inspector */}
          <Card>
            <CardHeader>
              <CardTitle subtitle="Selected graph node metadata">
                Selected Wallet
              </CardTitle>
              <Wallet className="w-4 h-4 text-navy-900" />
            </CardHeader>

            {selectedWallet ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">
                    Full Hex Address
                  </div>
                  <div className="font-mono text-xs text-navy-900 break-all select-all font-bold">
                    {selectedWallet.fullAddress}
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                  <span className="text-slate-600 font-medium">Hop Distance</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedWallet.level === 0
                      ? "Suspect (Origin)"
                      : `Hop ${selectedWallet.level}`}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => copyToClipboard(selectedWallet.fullAddress)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 border border-slate-300 transition-colors shadow-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Address
                      </>
                    )}
                  </button>

                  <a
                    href={`https://etherscan.io/address/${selectedWallet.fullAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 border border-slate-300 transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Explorer
                  </a>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-500 text-xs">
                Click any wallet node in the transaction graph to inspect its details.
              </div>
            )}
          </Card>

          <PatternsList findings={analysisData?.pattern_findings} />

          <InvestigatorAlert alert={analysisData?.alert} />

          <VaspAttribution
            analysisData={analysisData}
            defaultChain={caseData?.chain || "EVM"}
            selectedWallet={selectedWallet}
            onSelectWallet={handleSelectWallet}
          />
        </div>
      </div>
    </div>
  );
}

export default function InvestigatePage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-slate-500 font-mono text-xs">
          Loading Investigation Workspace...
        </div>
      }
    >
      <InvestigateContent />
    </Suspense>
  );
}
