"use client";

import React, { useEffect, useMemo, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  NodeMouseHandler,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { Focus, Maximize2, Network, Scan } from "lucide-react";
import { CustomWalletNode } from "./CustomWalletNode";
import { CustomNodeData } from "@/app/lib/graph";

interface TransactionGraphProps {
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node<CustomNodeData>>;
  onEdgesChange: OnEdgesChange;
  onNodeClick: NodeMouseHandler<Node<CustomNodeData>>;
  graphMode: "focused" | "full";
  onSwitchGraphMode: (mode: "focused" | "full") => void;
  totalWallets: number;
  totalEdges: number;
  disabled?: boolean;
}

function AutoFitOnUpdate({
  nodeCount,
  graphMode,
}: {
  nodeCount: number;
  graphMode: string;
}) {
  const { fitView } = useReactFlow();
  const lastState = useRef({ count: 0, mode: "" });

  useEffect(() => {
    if (
      nodeCount > 0 &&
      (lastState.current.count !== nodeCount ||
        lastState.current.mode !== graphMode)
    ) {
      lastState.current = { count: nodeCount, mode: graphMode };
      const timer = setTimeout(() => {
        fitView({ padding: 0.15, duration: 400 });
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [nodeCount, graphMode, fitView]);

  return null;
}

function TransactionGraphInner({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  graphMode,
  onSwitchGraphMode,
  totalWallets,
  totalEdges,
  disabled,
}: TransactionGraphProps) {
  const nodeTypes = useMemo(() => ({ walletNode: CustomWalletNode }), []);
  const { fitView } = useReactFlow();

  const handleFitView = () => {
    fitView({ padding: 0.15, duration: 400 });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-card flex flex-col h-[580px]">
      {/* Graph Toolbar Header */}
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-navy-900 uppercase">
              LIVE FUND FLOW
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              CANVAS ACTIVE
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
            Transaction Intelligence Graph
          </h3>
          <p className="text-xs text-slate-500">
            Showing <strong className="text-navy-900 font-bold">{nodes.length}</strong> of{" "}
            <strong className="text-slate-800">{totalWallets}</strong> traced wallets •{" "}
            <strong className="text-navy-900 font-bold">{edges.length}</strong> connections
          </p>
        </div>

        {/* Mode Switcher & Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleFitView}
            disabled={disabled || nodes.length === 0}
            title="Fit entire graph to screen"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-navy-900 hover:bg-slate-200/70 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Scan className="w-3.5 h-3.5" />
            Fit Screen
          </button>

          <div className="bg-slate-100 border border-slate-200 p-1 rounded-lg flex items-center gap-1">
            <button
              onClick={() => onSwitchGraphMode("focused")}
              disabled={disabled}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                graphMode === "focused"
                  ? "bg-navy-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Focus className="w-3.5 h-3.5" />
              Focused View
            </button>
            <button
              onClick={() => onSwitchGraphMode("full")}
              disabled={disabled}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                graphMode === "full"
                  ? "bg-navy-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Full Graph
            </button>
          </div>
        </div>
      </div>

      {/* Mode helper description banner */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 font-mono flex items-center justify-between">
        <span>
          {graphMode === "focused"
            ? "Focused View prioritizes the critical suspect path for visual inspection."
            : `Full Graph displays all ${totalWallets} traced wallets and ${totalEdges} connections across the network.`}
        </span>
        <span className="text-slate-500 hidden sm:inline font-sans">
          Tip: Use mouse wheel to zoom, drag to pan, click any node to inspect
        </span>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 min-h-0 w-full relative bg-slate-50">
        {nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-50">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-navy-900 mb-4 shadow-sm">
              <Network className="w-8 h-8 text-navy-900" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Ready for Investigation
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
              Enter a suspect wallet address above to generate the live blockchain transaction intelligence graph.
            </p>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.12 }}
            minZoom={0.01}
            maxZoom={2.5}
            panOnDrag
            zoomOnScroll
            onlyRenderVisibleElements
            nodesConnectable={false}
          >
            <AutoFitOnUpdate
              nodeCount={nodes.length}
              graphMode={graphMode}
            />
            <Background color="#cbd5e1" gap={24} size={1} />
            <MiniMap
              pannable
              zoomable
              nodeStrokeColor="#0f172a"
              nodeColor="#1e293b"
              maskColor="rgba(241, 245, 249, 0.7)"
            />
            <Controls showZoom showFitView showInteractive />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}

export function TransactionGraph(props: TransactionGraphProps) {
  return (
    <ReactFlowProvider>
      <TransactionGraphInner {...props} />
    </ReactFlowProvider>
  );
}
