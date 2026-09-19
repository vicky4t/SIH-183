import {
  Case,
  TraceResponse,
  AnalysisResponse,
  HealthResponse,
} from "@/app/types";

// ============================================================================
// Central API Configuration & Validation
// ============================================================================

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  ""
).replace(/\/+$/, "");

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured. Add it to .env.local");
}

// Backward-compatible alias for existing components
export const API_BASE = API_URL;

// ============================================================================
// Error Handling
// ============================================================================

export class ApiError extends Error {
  status: number;
  statusText: string;
  data?: unknown;

  constructor(status: number, message: string, statusText: string = "", data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let data: Record<string, unknown> | null = null;
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : null;
  } catch {
    data = text ? { detail: text } : null;
  }

  if (!response.ok) {
    let message = "";
    if (typeof data?.detail === "string" && data.detail.trim()) {
      message = data.detail.trim();
    } else if (typeof data?.message === "string" && data.message.trim()) {
      message = data.message.trim();
    } else {
      switch (response.status) {
        case 400:
          message = "Bad Request (400): Invalid request parameters or input data.";
          break;
        case 401:
          message = "Unauthorized (401): Authentication required or session expired.";
          break;
        case 403:
          message = "Forbidden (403): You do not have permission to access this resource.";
          break;
        case 404:
          message = "Not Found (404): The requested resource was not found.";
          break;
        case 500:
          message = "Internal Server Error (500): The backend server encountered an error.";
          break;
        case 502:
          message = "Bad Gateway (502): Backend service is unreachable.";
          break;
        case 503:
          message = "Service Unavailable (503): Backend service is temporarily offline.";
          break;
        default:
          message = `Request failed with HTTP status ${response.status}${
            response.statusText ? ` (${response.statusText})` : ""
          }`;
      }
    }

    throw new ApiError(response.status, message, response.statusText, data);
  }

  return (data ?? {}) as unknown as T;
}

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_URL}${cleanPath}`;

  try {
    return await fetch(url, options);
  } catch (err) {
    const errorDetail = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Network error: Unable to connect to backend at ${API_URL}. Please verify the backend server is running. (${errorDetail})`
    );
  }
}

// ============================================================================
// API Endpoints
// ============================================================================

export async function getCases(): Promise<Case[]> {
  const response = await apiFetch("/api/cases", {
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
  const response = await apiFetch("/api/cases", {
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

export async function traceCase(caseId: string, maxNodes: number = 1000): Promise<TraceResponse> {
  const response = await apiFetch(
    `/api/cases/${encodeURIComponent(caseId)}/trace?max_nodes=${maxNodes}`,
    {
      cache: "no-store",
    }
  );
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
  return `${API_URL}/api/reports/${encodeURIComponent(caseId)}/pdf`;
}

export async function downloadReportPdf(caseId: string): Promise<void> {
  const url = getReportPdfUrl(caseId);
  let response: Response;
  try {
    response = await fetch(url);
  } catch (err) {
    const errorDetail = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Network error: Unable to download PDF report from ${API_URL}. (${errorDetail})`
    );
  }

  if (!response.ok) {
    let detail = `PDF generation failed (HTTP ${response.status})`;
    try {
      const data = await response.json();
      detail = data?.detail || data?.message || detail;
    } catch {
      // response was not JSON
    }
    throw new ApiError(response.status, detail, response.statusText);
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `ShadowTrace_${caseId}_Investigation_Report.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}
