"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  RefreshCw,
} from "lucide-react";
import { getCases, analyzeCase, downloadReportPdf } from "@/app/lib/api";
import { Case } from "@/app/types";
import { shortAddress } from "@/app/lib/formatters";
import { RiskBadge, StatusBadge, ChainBadge } from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { StatusBanner } from "@/app/components/ui/StatusBanner";

export default function ReportsPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionCase, setActionCase] = useState<string | null>(null);
  const [downloadingCase, setDownloadingCase] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCases = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCases();
      setCases(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load investigation cases.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    getCases()
      .then((data) => {
        if (!ignore) setCases(Array.isArray(data) ? data : []);
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load investigation cases.");
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleAnalyze = async (item: Case) => {
    setActionCase(item.case_id);
    setError("");
    setMessage("");
    try {
      const result = await analyzeCase(item.case_id);
      const risk = result?.analysis?.risk?.risk_level || "UNKNOWN";
      const score = result?.analysis?.risk?.risk_score ?? 0;
      setMessage(
        `${item.case_id} analyzed successfully • Threat Risk: ${risk} (${score}/100)`
      );
      await loadCases();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to analyze ${item.case_id}.`);
    } finally {
      setActionCase(null);
    }
  };

  const handleDownload = async (item: Case) => {
    setDownloadingCase(item.case_id);
    setError("");
    setMessage("");
    try {
      await downloadReportPdf(item.case_id);
      setMessage(
        `${item.case_id} investigation report PDF generated and downloaded successfully.`
      );
      await loadCases();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : `Failed to generate PDF for ${item.case_id}.`);
    } finally {
      setDownloadingCase(null);
    }
  };

  const analyzedCount = useMemo(
    () => cases.filter((item) => item.status === "ANALYZED").length,
    [cases]
  );

  const pendingCount = useMemo(
    () => cases.filter((item) => item.status !== "ANALYZED").length,
    [cases]
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <div className="text-[10px] sm:text-xs font-bold tracking-widest text-navy-900 uppercase font-mono mb-0.5 sm:mb-1">
            FORENSIC EVIDENCE
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Investigation Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            Analyze cryptocurrency fraud cases and export investigator-ready ShadowTrace PDF reports.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={loadCases}
          loading={loading}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
          className="self-start sm:self-auto shrink-0 text-xs"
        >
          Refresh Cases
        </Button>
      </div>

      {error && <StatusBanner type="error" message={error} />}
      {message && <StatusBanner type="success" message={message} />}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-navy-900 shrink-0">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 block truncate">
                Total Cases
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                {cases.length}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 block truncate">
                Analyzed Cases
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                {analyzedCount}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 block truncate">
                Pending Analysis
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                {pendingCount}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800 shrink-0">
              <Download className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 block truncate">
                PDF Reports
              </span>
              <div className="text-base sm:text-lg font-bold text-navy-900 mt-0.5 sm:mt-1 truncate">
                Ready to Export
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Reports Table Card */}
      <Card className="p-0 overflow-hidden border border-slate-200 shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
            Loading investigation cases...
          </div>
        ) : cases.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <FileText className="w-10 h-10 text-slate-400 mb-2" />
            <div className="font-bold text-slate-800">
              No investigation cases available
            </div>
          </div>
        ) : (
          <div className="w-full max-w-full overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 sm:py-3 px-2 sm:px-3 md:px-4 font-bold">
                    <span className="md:hidden">Case &amp; Target</span>
                    <span className="hidden md:inline">Case ID</span>
                  </th>
                  <th className="py-2.5 sm:py-3 px-3 md:px-4 font-bold hidden md:table-cell">Wallet Address</th>
                  <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 md:px-4 font-bold hidden sm:table-cell">Chain</th>
                  <th className="py-2.5 sm:py-3 px-2 sm:px-3 md:px-4 font-bold">Threat Risk</th>
                  <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 md:px-4 font-bold hidden sm:table-cell">Status</th>
                  <th className="py-2.5 sm:py-3 px-4 font-bold text-center hidden lg:table-cell">Analysis</th>
                  <th className="py-2.5 sm:py-3 px-4 font-bold text-right hidden lg:table-cell">PDF Report</th>
                  <th className="py-2.5 sm:py-3 px-2 sm:px-3 md:px-4 font-bold text-right lg:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((item) => {
                  const isAnalyzing = actionCase === item.case_id;
                  const isDownloading = downloadingCase === item.case_id;

                  return (
                    <tr
                      key={item.case_id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Case ID (+ on mobile: Wallet & Chain) */}
                      <td className="py-2.5 sm:py-3 px-2 sm:px-3 md:px-4 align-middle">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight truncate max-w-[110px] xs:max-w-[150px] sm:max-w-none">
                          {item.case_id}
                        </div>
                        {item.complaint_id && (
                          <div className="text-[10px] text-slate-500 font-mono truncate max-w-[110px] xs:max-w-[150px] sm:max-w-none">
                            {item.complaint_id}
                          </div>
                        )}
                        <div className="md:hidden mt-0.5 font-mono text-[10px] sm:text-[11px] text-slate-600 truncate max-w-[110px] xs:max-w-[150px]">
                          {shortAddress(item.wallet_address, 6, 4)}
                        </div>
                        <div className="sm:hidden mt-1">
                          <ChainBadge chain={item.chain} />
                        </div>
                      </td>

                      {/* Dedicated Wallet Address (md+) */}
                      <td className="py-2.5 sm:py-3 px-3 md:px-4 font-mono font-medium text-slate-700 hidden md:table-cell align-middle whitespace-nowrap">
                        {shortAddress(item.wallet_address, 10, 8)}
                      </td>

                      {/* Dedicated Chain (sm+) */}
                      <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 md:px-4 hidden sm:table-cell align-middle whitespace-nowrap">
                        <ChainBadge chain={item.chain} />
                      </td>

                      {/* Threat Risk (Always visible) */}
                      <td className="py-2.5 sm:py-3 px-2 sm:px-3 md:px-4 align-middle">
                        <RiskBadge risk={item.risk_level} />
                        <div className="sm:hidden mt-1">
                          <StatusBadge status={item.status} />
                        </div>
                      </td>

                      {/* Dedicated Status (sm+) */}
                      <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 md:px-4 hidden sm:table-cell align-middle whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Desktop Analysis (lg+) */}
                      <td className="py-2.5 sm:py-3 px-4 text-center hidden lg:table-cell align-middle whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleAnalyze(item)}
                          disabled={isAnalyzing || isDownloading}
                          loading={isAnalyzing}
                          icon={<Activity className="w-3.5 h-3.5" />}
                          className="text-xs whitespace-nowrap"
                        >
                          {item.status === "ANALYZED" ? "Re-analyze" : "Analyze"}
                        </Button>
                      </td>

                      {/* Desktop PDF Report (lg+) */}
                      <td className="py-2.5 sm:py-3 px-4 text-right hidden lg:table-cell align-middle whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleDownload(item)}
                          disabled={isDownloading || isAnalyzing}
                          loading={isDownloading}
                          icon={<Download className="w-3.5 h-3.5" />}
                          className="text-xs whitespace-nowrap"
                        >
                          Download PDF
                        </Button>
                      </td>

                      {/* Mobile/Tablet Combined Actions (< lg) */}
                      <td className="py-2.5 sm:py-3 px-2 sm:px-3 md:px-4 text-right lg:hidden align-middle">
                        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleAnalyze(item)}
                            disabled={isAnalyzing || isDownloading}
                            loading={isAnalyzing}
                            icon={<Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />}
                            className="px-2 py-1 text-[10px] sm:text-xs whitespace-nowrap"
                          >
                            <span className="hidden xs:inline">
                              {item.status === "ANALYZED" ? "Re-analyze" : "Analyze"}
                            </span>
                            <span className="xs:hidden">
                              {item.status === "ANALYZED" ? "Re-run" : "Run"}
                            </span>
                          </Button>

                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleDownload(item)}
                            disabled={isDownloading || isAnalyzing}
                            loading={isDownloading}
                            icon={<Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />}
                            className="px-2 py-1 text-[10px] sm:text-xs whitespace-nowrap"
                          >
                            <span className="hidden xs:inline">Download PDF</span>
                            <span className="xs:hidden">PDF</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            Showing <strong className="text-slate-900 font-bold">{cases.length}</strong> total cases available for forensic reporting
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {analyzedCount} analyzed • {pendingCount} pending
          </span>
        </div>
      </Card>
    </div>
  );
}
