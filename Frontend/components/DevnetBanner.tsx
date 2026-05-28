"use client";

import { useNetwork } from "@/context/NetworkContext";
import { AlertTriangle } from "lucide-react";

export function DevnetBanner() {
  const { isDevnet } = useNetwork();

  if (!isDevnet) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2 bg-yellow-500/90 backdrop-blur-md text-black px-4 py-2.5 rounded-xl shadow-lg shadow-yellow-500/30 border border-yellow-400 animate-pulse-slow select-none pointer-events-none">
      <AlertTriangle size={16} className="shrink-0" />
      <div className="flex flex-col">
        <span className="text-xs font-black uppercase tracking-wider leading-none">Devnet Mode</span>
        <span className="text-[10px] font-medium opacity-80 leading-tight">Not using real SOL</span>
      </div>
    </div>
  );
}
