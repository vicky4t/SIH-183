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
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold tracking-widest text-navy-900 uppercase font-mono mb-1">
            FORENSIC EVIDENCE
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Investigation Reports
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Analyze cryptocurrency fraud cases and export investigator-ready ShadowTrace PDF reports.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={loadCases}
          loading={loading}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
        >
          Refresh Cases
        </Button>
      </div>

      {error && <StatusBanner type="error" message={error} />}
      {message && <StatusBanner type="success" message={message} />}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-navy-900">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Cases
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {cases.length}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Analyzed Cases
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {analyzedCount}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pending Analysis
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {pendingCount}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                PDF Reports
              </span>
              <div className="text-lg font-bold text-navy-900 mt-1">
                Ready to Export
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Reports Table Card */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">Case ID</th>
                  <th className="py-3 px-4 font-bold">Wallet Address</th>
                  <th className="py-3 px-4 font-bold">Chain</th>
                  <th className="py-3 px-4 font-bold">Threat Risk</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-center">Analysis</th>
                  <th className="py-3 px-4 font-bold text-right">PDF Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((item) => {
                  const isAnalyzing = actionCase === item.case_id;
                  const isDownloading = downloadingCase === item.case_id;

                  return (
                    <tr
                      key={item.case_id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {item.case_id}
                        </div>
                        {item.complaint_id && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            {item.complaint_id}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {shortAddress(item.wallet_address, 10, 8)}
                      </td>

                      <td className="py-3.5 px-4">
                        <ChainBadge chain={item.chain} />
                      </td>

                      <td className="py-3.5 px-4">
                        <RiskBadge risk={item.risk_level} />
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleAnalyze(item)}
                          disabled={isAnalyzing || isDownloading}
                          loading={isAnalyzing}
                          icon={<Activity className="w-3.5 h-3.5" />}
                          className="text-xs"
                        >
                          {item.status === "ANALYZED" ? "Re-analyze" : "Analyze"}
                        </Button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleDownload(item)}
                          disabled={isDownloading || isAnalyzing}
                          loading={isDownloading}
                          icon={<Download className="w-3.5 h-3.5" />}
                          className="text-xs"
                        >
                          Download PDF
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-600">
          Showing <strong className="text-slate-900 font-bold">{cases.length}</strong> total cases available for forensic reporting
        </div>
      </Card>
    </div>
  );
}
