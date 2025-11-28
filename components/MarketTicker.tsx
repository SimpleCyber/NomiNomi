"use client";

import { ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";

const markets = [
  {
    id: 1,
    name: "Bitcoin",
    symbol: "BTC",
    price: "$91,546.80",
    volume: "$5.2M",
    marketCap: "$1.8T",
    change: "+0.31%",
    isPositive: true,
    chartData: [40, 42, 45, 43, 48, 50, 52, 51, 53, 55],
  },
  {
    id: 2,
    name: "Ethereum",
    symbol: "ETH",
    price: "$3,025.21",
    volume: "$11.3M",
    marketCap: "$363.7B",
    change: "-0.33%",
    isPositive: false,
    chartData: [60, 58, 55, 57, 54, 52, 50, 51, 49, 48],
  },
  {
    id: 3,
    name: "USDT",
    symbol: "USDT",
    price: "$1.00",
    volume: "$1.1M",
    marketCap: "$184.5B",
    change: "0.00%",
    isPositive: true,
    chartData: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
  },
  {
    id: 4,
    name: "XRP",
    symbol: "XRP",
    price: "$2.1992",
    volume: "$26.7K",
    marketCap: "$132.1B",
    change: "-0.13%",
    isPositive: false,
    chartData: [30, 32, 31, 29, 28, 27, 28, 26, 25, 24],
  },
  {
    id: 5,
    name: "BNB",
    symbol: "BNB",
    price: "$896.20",
    volume: "$118.2K",
    marketCap: "$123.2B",
    change: "+0.01%",
    isPositive: true,
    chartData: [70, 71, 72, 73, 74, 75, 76, 77, 78, 79],
  },
  {
    id: 6,
    name: "Solana",
    symbol: "SOL",
    price: "$140.27",
    volume: "$15.5M",
    marketCap: "$78.3B",
    change: "-1.90%",
    isPositive: false,
    chartData: [50, 48, 46, 44, 42, 40, 38, 36, 34, 32],
  },
   {
    id: 7,
    name: "Dogecoin",
    symbol: "DOGE",
    price: "$0.15076",
    volume: "$11.5K",
    marketCap: "$22.9B",
    change: "-2.34%",
    isPositive: false,
    chartData: [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
  },
];

const Sparkline = ({ data, isPositive }: { data: number[]; isPositive: boolean }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 30;
  const width = 100;
  const step = width / (data.length - 1);

  const points = data
    .map((val, i) => {
      const x = i * step;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? "#10b981" : "#ef4444"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function MarketTicker() {
  const [activeTab, setActiveTab] = useState("Spot");

  return (
    <div className="w-full max-w-[1400px] mx-auto mt-8 px-6 pb-12">
      <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] p-6">
        <div className="flex items-center gap-2 mb-6">
            {["Spot", "Futures", "Lend"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab
                    ? "bg-white/10 dark:bg-white/10 bg-black/5 text-[var(--foreground)]"
                    : "text-[var(--muted)] hover:text-blue-500"
                }`}
              >
                {tab}
              </button>
            ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="text-left text-xs text-[var(--muted)] border-b border-[var(--border-color)]">
                <th className="pb-4 pl-4 font-medium">Name</th>
                <th className="pb-4 font-medium text-right">Price</th>
                <th className="pb-4 font-medium text-right">24h Volume</th>
                <th className="pb-4 font-medium text-right">Market Cap</th>
                <th className="pb-4 font-medium text-right">24h Change</th>
                <th className="pb-4 font-medium text-right pr-4">Last 7 Days</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((market) => (
                <tr
                  key={market.id}
                  className="border-b border-[var(--border-color)] last:border-none hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-[var(--foreground)]">
                        {market.symbol[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[var(--foreground)]">
                          {market.name}
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          {market.symbol}/USD
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-right text-sm font-medium text-[var(--foreground)]">
                    {market.price}
                  </td>
                  <td className="py-4 text-right text-sm font-medium text-[var(--foreground)]">
                    {market.volume}
                  </td>
                  <td className="py-4 text-right text-sm font-medium text-[var(--foreground)]">
                    {market.marketCap}
                  </td>
                  <td
                    className={`py-4 text-right text-sm font-medium ${
                      market.isPositive ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {market.change}
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex justify-end">
                      <Sparkline
                        data={market.chartData}
                        isPositive={market.isPositive}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
