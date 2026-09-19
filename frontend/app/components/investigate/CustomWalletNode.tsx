"use client";

import React, { memo } from "react";
import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { Wallet, ShieldAlert } from "lucide-react";
import { CustomNodeData } from "@/app/lib/graph";
import { cn } from "@/app/lib/formatters";

export const CustomWalletNode = memo(function CustomWalletNode({
  data,
  selected,
}: NodeProps<Node<CustomNodeData>>) {
  const { isRoot, level, shortLabel } = data;

  return (
    <div
      className={cn(
        "px-3.5 py-2.5 rounded-xl border transition-all duration-150 select-none min-w-[210px] bg-white",
        isRoot
          ? "border-2 border-rose-500 shadow-md ring-1 ring-rose-200"
          : "border border-slate-300 hover:border-navy-900 shadow-sm",
        selected && "ring-2 ring-navy-900 border-navy-900 shadow-md"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-navy-900 !w-2.5 !h-2.5 !border-white"
      />

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
            isRoot
              ? "bg-rose-100 text-rose-700 border border-rose-200"
              : "bg-slate-100 text-navy-900 border border-slate-200"
          )}
        >
          {isRoot ? (
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          ) : (
            <Wallet className="w-4 h-4 text-navy-900" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span
              className={cn(
                "text-[10px] font-extrabold tracking-wider uppercase font-mono",
                isRoot ? "text-rose-700" : "text-navy-900"
              )}
            >
              {isRoot ? "SUSPECT WALLET" : `HOP ${level} WALLET`}
            </span>
          </div>
          <div className="text-xs font-mono font-bold text-slate-900 truncate mt-0.5">
            {shortLabel}
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-navy-900 !w-2.5 !h-2.5 !border-white"
      />
    </div>
  );
});
