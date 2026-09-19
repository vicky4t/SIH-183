export interface Case {
  case_id: string;
  complaint_id?: string | null;
  wallet_address: string;
  chain?: string;
  fraud_type?: string;
  amount?: number | null;
  currency?: string | null;
  risk_level?: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN" | string;
  status?: "PENDING" | "ANALYZING" | "ANALYZED" | string;
}

export interface TraceGraphNodeInfo {
  hop?: number;
  connected_wallets?: string[];
}

export interface TraceGraph {
  root_wallet: string;
  max_hops: number;
  wallets_analyzed?: number;
  graph: Record<string, TraceGraphNodeInfo>;
}

export interface TraceResponse {
  case_id: string;
  wallet_address: string;
  chain: string;
  trace: TraceGraph;
}

export interface PatternFinding {
  pattern?: string;
  wallet?: string;
  description?: string;
  details?: Record<string, unknown>;
}

export interface VaspMatch {
  exchange?: string;
  type?: string;
  chain?: string;
  matched_address?: string;
  match_type?: string;
}

export interface NearestVasp {
  vasp_found: boolean;
  nearest_vasp?: VaspMatch | null;
  hop_distance?: number;
  path?: string[];
}

export interface RiskAnalysis {
  risk_level: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN" | string;
  risk_score: number;
  reasons: string[];
}

export interface AlertData {
  alert_type?: string;
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | string;
  risk_level?: string;
  risk_score?: number;
  generated_at?: string;
  reasons?: string[];
}

export interface AnalysisData {
  case_id?: string;
  risk?: RiskAnalysis;
  pattern_findings?: PatternFinding[];
  exchange_matches?: VaspMatch[];
  nearest_vasp?: NearestVasp;
  alert?: AlertData;
}

export interface AnalysisResponse {
  status: string;
  analysis: AnalysisData;
}

export interface HealthResponse {
  status: string;
}

export interface GraphStatData {
  wallets: number;
  edges: number;
}
