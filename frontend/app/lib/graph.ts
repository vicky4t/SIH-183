import { Edge, MarkerType, Node, Position } from "@xyflow/react";
import { TraceGraph } from "@/app/types";

export interface CustomNodeData extends Record<string, unknown> {
  fullAddress: string;
  level: number;
  isRoot: boolean;
  shortLabel: string;
}

export interface BuildGraphResult {
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  totalWallets: number;
  totalEdges: number;
}

const FOCUSED_MAX_NODES = 25;
const FOCUSED_HOP1_LIMIT = 8;
const FOCUSED_HOP2_LIMIT = 16;
const FULL_GRAPH_MAX_NODES = 1000;

function normalizeGraph(
  trace?: TraceGraph
): Record<string, { hop?: number; connected_wallets: string[] }> {
  const traceObj = trace as unknown as Record<string, unknown> | undefined;
  const actualTrace =
    (traceObj?.trace as TraceGraph | undefined) || trace;
  const sourceGraph = (actualTrace?.graph || {}) as Record<
    string,
    { hop?: number; connected_wallets?: string[] }
  >;
  const graph: Record<string, { hop?: number; connected_wallets: string[] }> = {};

  Object.entries(sourceGraph).forEach(([wallet, info]) => {
    const normalizedWallet = String(wallet).toLowerCase();
    const connected = (info?.connected_wallets || [])
      .map((item) => String(item).toLowerCase())
      .filter((item) => item !== normalizedWallet);

    graph[normalizedWallet] = {
      hop: info?.hop,
      connected_wallets: connected,
    };
  });

  return graph;
}

export function buildGraph(
  trace?: TraceGraph,
  rootWallet?: string,
  mode: "focused" | "full" = "full",
  maxNodes: number = FULL_GRAPH_MAX_NODES
): BuildGraphResult {
  const graph = normalizeGraph(trace);
  const traceObj = trace as unknown as Record<string, unknown> | undefined;
  const actualTrace =
    (traceObj?.trace as TraceGraph | undefined) || trace;
  const traceWallet =
    typeof traceObj?.wallet_address === "string"
      ? traceObj.wallet_address
      : "";
  const root = (
    rootWallet ||
    actualTrace?.root_wallet ||
    traceWallet ||
    Object.keys(graph)[0] ||
    ""
  ).toLowerCase();

  if (!root) {
    return {
      nodes: [],
      edges: [],
      totalWallets: 0,
      totalEdges: 0,
    };
  }

  const walletSet = new Set<string>([root]);

  Object.entries(graph).forEach(([wallet, info]) => {
    walletSet.add(wallet);
    (info?.connected_wallets || []).forEach((connected) => {
      walletSet.add(connected);
    });
  });

  // BFS for hop level determination and ancestry tracking
  const levelMap = new Map<string, number>();
  const parentMap = new Map<string, string>();
  levelMap.set(root, 0);

  const queue: string[] = [root];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    const currentLevel = levelMap.get(current) ?? 0;
    const info = graph[current];

    (info?.connected_wallets || []).forEach((connected) => {
      if (!levelMap.has(connected)) {
        levelMap.set(connected, currentLevel + 1);
        parentMap.set(connected, current);
        queue.push(connected);
      }
    });
  }

  walletSet.forEach((wallet) => {
    if (!levelMap.has(wallet)) {
      levelMap.set(wallet, 1);
    }
  });

  // Edge collection
  const allEdges: Edge[] = [];
  const seenEdges = new Set<string>();

  Object.entries(graph).forEach(([wallet, info]) => {
    (info?.connected_wallets || []).forEach((connected) => {
      const id = `${wallet}-${connected}`;
      if (seenEdges.has(id)) return;
      seenEdges.add(id);

      allEdges.push({
        id,
        source: wallet,
        target: connected,
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#06b6d4",
          width: 14,
          height: 14,
        },
        style: {
          stroke: "#0ea5e9",
          strokeWidth: 2,
        },
      });
    });
  });

  let visibleWallets: string[];
  const nodePositions = new Map<string, { x: number; y: number }>();

  if (mode === "focused") {
    // Curated top suspect path view
    const hop1: string[] = [];
    const hop2: string[] = [];

    Array.from(walletSet).forEach((wallet) => {
      const level = levelMap.get(wallet) ?? 1;
      if (level === 1) hop1.push(wallet);
      if (level === 2) hop2.push(wallet);
    });

    visibleWallets = [
      root,
      ...hop1.slice(0, FOCUSED_HOP1_LIMIT),
      ...hop2.slice(0, FOCUSED_HOP2_LIMIT),
    ].slice(0, FOCUSED_MAX_NODES);

    const grouped: Record<number, string[]> = {};
    visibleWallets.forEach((wallet) => {
      const level = levelMap.get(wallet) ?? 1;
      if (!grouped[level]) grouped[level] = [];
      grouped[level].push(wallet);
    });

    visibleWallets.forEach((wallet) => {
      const level = levelMap.get(wallet) ?? 1;
      const levelGroup = grouped[level] || [];
      const index = levelGroup.indexOf(wallet);
      const total = levelGroup.length;

      const x = 60 + level * 360;
      const y = 240 + (index - (total - 1) / 2) * 120;
      nodePositions.set(wallet, { x, y });
    });
  } else {
    // FULL GRAPH: Process and display up to 1,000 wallet nodes
    const allUnique = Array.from(walletSet);
    visibleWallets = allUnique.length > maxNodes ? allUnique.slice(0, maxNodes) : allUnique;

    const hop1Nodes: string[] = [];
    const otherNodes: string[] = [];

    visibleWallets.forEach((w) => {
      const lvl = levelMap.get(w) ?? 1;
      if (lvl === 1) hop1Nodes.push(w);
      else if (lvl > 1) otherNodes.push(w);
    });

    // Group Hop 2+ children by their Hop 1 ancestor
    const childrenByParent = new Map<string, string[]>();
    hop1Nodes.forEach((h1) => childrenByParent.set(h1, []));
    const fallbackChildren: string[] = [];

    otherNodes.forEach((w) => {
      let ancestor = parentMap.get(w);
      while (ancestor && (levelMap.get(ancestor) ?? 0) > 1) {
        ancestor = parentMap.get(ancestor);
      }
      if (ancestor && childrenByParent.has(ancestor)) {
        childrenByParent.get(ancestor)?.push(w);
      } else {
        fallbackChildren.push(w);
      }
    });

    let currentY = 80;
    const rowHeight = 74;
    const colWidth = 265;
    const clusterGap = 40;

    hop1Nodes.forEach((h1) => {
      const children = childrenByParent.get(h1) || [];
      // Dynamic column count: scales neatly from 2 to 6 columns for large clusters
      const cols = Math.min(6, Math.max(2, Math.ceil(Math.sqrt(children.length))));
      const rowCount = Math.max(1, Math.ceil(children.length / cols));
      const clusterHeight = rowCount * rowHeight;
      const parentY = currentY + (clusterHeight - rowHeight) / 2;

      nodePositions.set(h1, { x: 420, y: parentY });

      children.forEach((child, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const childX = 750 + col * colWidth;
        const childY = currentY + row * rowHeight;
        nodePositions.set(child, { x: childX, y: childY });
      });

      currentY += clusterHeight + clusterGap;
    });

    if (fallbackChildren.length > 0) {
      const cols = Math.min(6, Math.max(2, Math.ceil(Math.sqrt(fallbackChildren.length))));
      fallbackChildren.forEach((child, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const childX = 750 + col * colWidth;
        const childY = currentY + row * rowHeight;
        nodePositions.set(child, { x: childX, y: childY });
      });
      currentY += Math.ceil(fallbackChildren.length / cols) * rowHeight + clusterGap;
    }

    // Center root vertically relative to all Hop 1 clusters
    const rootY = Math.max(200, currentY / 2);
    nodePositions.set(root, { x: 60, y: rootY });
  }

  const visibleSet = new Set(visibleWallets);
  const visibleEdges = allEdges.filter(
    (edge) => visibleSet.has(edge.source) && visibleSet.has(edge.target)
  );

  // Performance optimization for large graphs (> 150 edges):
  // Animate root connections while keeping peer edges static to preserve 60 FPS
  const isLargeGraph = visibleEdges.length > 150;
  const optimizedEdges: Edge[] = visibleEdges.map((edge) => {
    const isRootEdge = edge.source === root || edge.target === root;
    return {
      ...edge,
      animated: isLargeGraph ? isRootEdge : true,
    };
  });

  const nodes: Node<CustomNodeData>[] = visibleWallets.map((wallet) => {
    const level = levelMap.get(wallet) ?? 1;
    const isRoot = wallet === root;
    const pos = nodePositions.get(wallet) || { x: 60, y: 200 };

    const shortLabel =
      wallet.length > 16
        ? `${wallet.slice(0, 8)}...${wallet.slice(-6)}`
        : wallet;

    return {
      id: wallet,
      type: "walletNode",
      position: pos,
      data: {
        fullAddress: wallet,
        level,
        isRoot,
        shortLabel,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
  });

  return {
    nodes,
    edges: optimizedEdges,
    totalWallets: walletSet.size,
    totalEdges: allEdges.length,
  };
}
