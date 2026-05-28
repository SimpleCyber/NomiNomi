"use client";

import { LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import { Sparkline } from "@/components/ui/Sparkline";

interface Coin {
  id: string;
  name: string;
  symbol: string;
  image?: string;
  marketCap?: string;
  volume?: string;
  change?: string;
  bondingCurve?: number;
  description?: string;
  creatorAddress?: string;
  // Add other fields as needed based on your data structure
  [key: string]: any;
}

interface CoinDisplayProps {
  coins: Coin[];
  isLoading?: boolean;
  onCoinClick?: (coin: Coin) => void;
  emptyMessage?: string;
}

export default function CoinDisplay({ 
  coins, 
  isLoading = false, 
  onCoinClick,
  emptyMessage = "No coins found.",
  viewMode = "list"
}: CoinDisplayProps & { viewMode: "list" | "cards" }) {
  
  if (isLoading) {
    return <div className="py-10 text-center text-[var(--muted)]">Loading...</div>;
  }

  if (coins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-[var(--muted)]">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full">


      {viewMode === "list" ? (
        <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] p-6 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr className="text-left text-xs text-[var(--muted)] border-b border-[var(--border-color)]">
                  <th className="pb-4 pl-4 font-medium uppercase">Coin</th>
                  <th className="pb-4 font-medium text-right uppercase">Mcap</th>
                  <th className="pb-4 font-medium text-right uppercase">Volume</th>
                  <th className="pb-4 font-medium text-right uppercase">Bonding Curve</th>
                  <th className="pb-4 font-medium text-right pr-4 uppercase">24H</th>
                </tr>
              </thead>
              <tbody>
                {coins.map((coin, index) => (
                  <tr
                    key={coin.id}
                    onClick={() => onCoinClick?.(coin)}
                    className="border-b border-[var(--border-color)] last:border-none hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer h-16"
                  >
                    <td className="pl-4">
                      <div className="flex items-center gap-3">
                        <span className="text-[var(--muted)] text-sm w-4">
                          #{index + 1}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-[var(--foreground)] overflow-hidden">
                          {coin.image ? (
                            <img src={coin.image} alt={coin.symbol} className="w-full h-full object-cover" />
                          ) : (
                            coin.symbol?.[0] || "?"
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[var(--foreground)]">
                            {coin.name}
                          </div>
                          <div className="text-xs text-[var(--muted)]">
                            {coin.symbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right text-sm font-medium text-[var(--foreground)]">
                      {coin.marketCap || "-"}
                    </td>
                    <td className="text-right text-sm text-[var(--foreground)]">
                      {coin.volume || "-"}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 h-1.5 bg-[var(--input-bg)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (coin.bondingCurve || 0) > 80 
                                ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" 
                                : "bg-emerald-400"
                            }`}
                            style={{ width: `${coin.bondingCurve || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-[var(--foreground)]">
                          {coin.bondingCurve || 0}%
                        </span>
                      </div>
                    </td>
                    <td
                      className={`text-right text-sm font-medium pr-4 ${
                        (coin.change || "").startsWith("+") 
                          ? "text-emerald-500" 
                          : (coin.change || "").startsWith("-") 
                            ? "text-red-500" 
                            : "text-[var(--muted)]"
                      }`}
                    >
                      {coin.change || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coins.map((coin) => (
            <div
              key={coin.id}
              onClick={() => onCoinClick?.(coin)}
              className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-5 hover:border-blue-500/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-[var(--foreground)] overflow-hidden">
                    {coin.image ? (
                        <img src={coin.image} alt={coin.symbol} className="w-full h-full object-cover" />
                      ) : (
                        coin.symbol?.[0] || "?"
                      )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--foreground)]">
                      {coin.name}
                    </h3>
                    <p className="text-sm text-[var(--muted)]">
                      {coin.symbol}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-sm font-bold ${
                    (coin.change || "").startsWith("+") 
                        ? "text-emerald-500" 
                        : (coin.change || "").startsWith("-") 
                        ? "text-red-500" 
                        : "text-[var(--muted)]"
                  }`}
                >
                  {coin.change || "-"}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">Market Cap</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {coin.marketCap || "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">Volume</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {coin.volume || "-"}
                  </span>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-xs text-[var(--muted)] mb-1">
                    <span>Bonding Curve</span>
                    <span
                      className={
                        (coin.bondingCurve || 0) > 80
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }
                    >
                      {coin.bondingCurve || 0}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--input-bg)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        (coin.bondingCurve || 0) > 80 
                            ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" 
                            : "bg-emerald-400"
                      }`}
                      style={{ width: `${coin.bondingCurve || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
