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

export interface NearestVaspMatch extends VaspMatch {
  hop_distance?: number;
  path?: string[];
}

export interface NearestVasp {
  vasp_found: boolean;
  nearest_vasp?: VaspMatch | null;
  hop_distance?: number | null;
  path?: string[];
  matches?: NearestVaspMatch[];
}

export interface ClusterMember {
  wallet: string;
  score: number;
  reasons: string[];
}

export interface WalletCluster {
  cluster_found?: boolean;
  cluster_id?: string;
  cluster_type?: string;
  root_wallet?: string;
  cluster_size?: number;
  confidence?: "HIGH" | "MEDIUM" | "LOW" | string | number;
  wallets?: string[];
  members?: ClusterMember[];
  reasons?: string[];
  disclaimer?: string;
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
  wallet_address?: string;
  transaction_summary?: {
    received_transactions?: number;
    unique_transactions?: number;
    duplicates_removed?: number;
  };
  risk?: RiskAnalysis;
  pattern_findings?: PatternFinding[];
  exchange_matches?: VaspMatch[];
  nearest_vasp?: NearestVasp;
  wallet_cluster?: WalletCluster;
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
