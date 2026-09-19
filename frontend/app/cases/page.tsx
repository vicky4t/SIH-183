"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, FolderOpen, RefreshCw, Search } from "lucide-react";
import { getCases } from "@/app/lib/api";
import { Case } from "@/app/types";
import { formatCurrency, shortAddress } from "@/app/lib/formatters";
import { RiskBadge, StatusBadge, ChainBadge } from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { StatusBanner } from "@/app/components/ui/StatusBanner";

export default function CasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const filteredCases = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cases;
    return cases.filter((item) =>
      [
        item.case_id,
        item.complaint_id,
        item.wallet_address,
        item.chain,
        item.fraud_type,
        item.status,
        item.risk_level,
        item.currency,
      ].some((val) => String(val || "").toLowerCase().includes(q))
    );
  }, [cases, search]);

  const openCase = (caseId: string) => {
    router.push(`/investigate?caseId=${encodeURIComponent(caseId)}`);
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold tracking-widest text-navy-900 uppercase font-mono mb-1">
            CASE MANAGEMENT
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Investigation Cases
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Search, filter, and inspect reported cryptocurrency fraud investigations.
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

      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4 text-navy-900" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Case ID, wallet address, blockchain, fraud type, risk, or status..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 transition-all shadow-sm"
        />
      </div>

      {/* Cases Table Card */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <RefreshCw className="w-8 h-8 text-navy-900 animate-spin mb-3" />
            <div className="font-bold text-slate-800 text-sm">
              Loading investigation cases...
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Fetching records from the backend database.
            </p>
          </div>
        ) : error ? (
          <div className="py-16 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-3">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div className="font-bold text-slate-800 text-sm">
              Unable to load cases
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {error}
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={loadCases}
              className="mt-4 text-xs font-bold"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Retry Connection
            </Button>
          </div>
        ) : cases.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <FolderOpen className="w-10 h-10 text-slate-400 mb-2" />
            <div className="font-bold text-slate-800 text-sm">
              No investigation cases recorded yet
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              There are no suspect wallet cases in the database. Enter a suspect wallet address on the Investigate page to launch an inquiry.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push("/investigate")}
              className="mt-4 text-xs font-bold bg-navy-900 text-white"
            >
              Trace New Wallet
            </Button>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <FolderOpen className="w-10 h-10 text-slate-400 mb-2" />
            <div className="font-bold text-slate-800">
              No matching cases found
            </div>
            <p className="text-xs text-slate-500 mt-1">
              No cases match &quot;{search}&quot;. Try adjusting your search query or clear the filter.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSearch("")}
              className="mt-4 text-xs"
            >
              Clear Search Filter
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">Case ID</th>
                  <th className="py-3 px-4 font-bold">Wallet Address</th>
                  <th className="py-3 px-4 font-bold">Chain</th>
                  <th className="py-3 px-4 font-bold">Fraud Type</th>
                  <th className="py-3 px-4 font-bold">Amount</th>
                  <th className="py-3 px-4 font-bold">Threat Risk</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.map((item) => (
                  <tr
                    key={item.case_id}
                    onClick={() => openCase(item.case_id)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-navy-900 transition-colors">
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

                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {item.fraud_type || "—"}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {formatCurrency(item.amount, item.currency)}
                    </td>

                    <td className="py-3.5 px-4">
                      <RiskBadge risk={item.risk_level} />
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCase(item.case_id);
                        }}
                        className="text-xs group-hover:border-navy-900 group-hover:text-navy-900"
                      >
                        Inspect
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-600 flex items-center justify-between">
          <div>
            Showing <strong className="text-slate-900 font-bold">{filteredCases.length}</strong> of{" "}
            <strong className="text-slate-900 font-bold">{cases.length}</strong> total cases
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Click any row to open the transaction graph
          </div>
        </div>
      </Card>
    </div>
  );
}
