import {
  Case,
  TraceResponse,
  AnalysisResponse,
  HealthResponse,
} from "@/app/types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_BASE}${path}`, options);
  } catch (err) {
    // Fallback to same-origin Next.js proxy if direct API_BASE fails in browser
    if (typeof window !== "undefined" && API_BASE && !path.startsWith("http")) {
      try {
        return await fetch(path, options);
      } catch {
        // ignore fallback error and throw original
      }
    }
    throw err;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let data: Record<string, unknown> | null = null;
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    data = { detail: text };
  }

  if (!response.ok) {
    const detail =
      typeof data?.detail === "string" ? data.detail : undefined;
    throw new Error(
      detail || `Request failed with status ${response.status}`
    );
  }

  return data as unknown as T;
}

export async function getCases(): Promise<Case[]> {
  const response = await apiFetch("/api/cases/", {
    cache: "no-store",
  });
  const data = await parseResponse<Record<string, unknown> | Case[]>(response);
  if (Array.isArray(data)) return data as Case[];
  if (data && typeof data === "object") {
    const cases =
      "cases" in data && Array.isArray(data.cases) ? data.cases : undefined;
    if (cases) return cases as Case[];
    const subData =
      "data" in data && Array.isArray(data.data) ? data.data : undefined;
    if (subData) return subData as Case[];
  }
  return [];
}

export async function createCase(walletAddress: string): Promise<Case> {
  const response = await apiFetch("/api/cases/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      wallet_address: walletAddress.trim(),
      fraud_type: "Cryptocurrency Fraud",
    }),
  });

  return parseResponse<Case>(response);
}

export async function traceCase(caseId: string): Promise<TraceResponse> {
  const response = await apiFetch(`/api/cases/${encodeURIComponent(caseId)}/trace`, {
    cache: "no-store",
  });
  return parseResponse<TraceResponse>(response);
}

export async function analyzeCase(caseId: string): Promise<AnalysisResponse> {
  const response = await apiFetch(`/api/cases/${encodeURIComponent(caseId)}/analyze`, {
    method: "POST",
  });
  return parseResponse<AnalysisResponse>(response);
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await apiFetch("/health", {
    cache: "no-store",
  });
  return parseResponse<HealthResponse>(response);
}

export function getReportPdfUrl(caseId: string): string {
  return `${API_BASE}/api/reports/${encodeURIComponent(caseId)}/pdf`;
}

export async function downloadReportPdf(caseId: string): Promise<void> {
  const response = await fetch(getReportPdfUrl(caseId));

  if (!response.ok) {
    let detail = `PDF generation failed (${response.status})`;
    try {
      const data = await response.json();
      detail = data?.detail || detail;
    } catch {
      // response wasn't json
    }
    throw new Error(detail);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ShadowTrace_${caseId}_Investigation_Report.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
