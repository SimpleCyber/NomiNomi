"use client";

import { ArrowUp, ArrowDown, LayoutGrid, List } from "lucide-react";
import { useState } from "react";

const markets = [
  {
    id: 1,
    name: "HAPPYSANTA",
    symbol: "Santa",
    price: "$15.80K",
    volume: "$414.38",
    marketCap: "$15.80K",
    change: "+298.45%",
    change5m: "-",
    change1h: "+298.45%",
    change6h: "+298.45%",
    isPositive: true,
    chartData: [10, 12, 11, 13, 15, 20, 25, 30, 35, 40],
    bondingCurve: 95,
    ath: "$15.9K",
    age: "17m",
    txns: 57,
    traders: 4,
    image: "/santa.png" // Placeholder
  },
  {
    id: 2,
    name: "butterjak",
    symbol: "butterjak",
    price: "$18.88K",
    volume: "$18.35K",
    marketCap: "$18.88K",
    change: "+263.51%",
    change5m: "+263.51%",
    change1h: "+263.51%",
    change6h: "+263.51%",
    isPositive: true,
    chartData: [20, 22, 25, 28, 30, 35, 40, 45, 50, 55],
    bondingCurve: 45,
    ath: "$26.7K",
    age: "1m",
    txns: 159,
    traders: 106,
    image: "/butterjak.png" // Placeholder
  },
  {
    id: 3,
    name: "The Spiderkid",
    symbol: "Spiderkid",
    price: "$19.53K",
    volume: "$37.22K",
    marketCap: "$19.53K",
    change: "+280.50%",
    change5m: "+67.92%",
    change1h: "+280.50%",
    change6h: "+280.50%",
    isPositive: true,
    chartData: [15, 18, 20, 22, 25, 24, 28, 32, 35, 38],
    bondingCurve: 60,
    ath: "$20.6K",
    age: "6m",
    txns: 789,
    traders: 296,
    image: "/spiderkid.png" // Placeholder
  },
  {
    id: 4,
    name: "Perillius Portal",
    symbol: "Perillius",
    price: "$25.74K",
    volume: "$212.58K",
    marketCap: "$25.74K",
    change: "+453.60%",
    change5m: "-28.52%",
    change1h: "+453.60%",
    change6h: "+453.60%",
    isPositive: true,
    chartData: [10, 15, 25, 35, 30, 25, 20, 15, 10, 12],
    bondingCurve: 30,
    ath: "$61.9K",
    age: "28m",
    txns: 3840,
    traders: 1006,
    image: "/portal.png" // Placeholder
  },
  {
    id: 5,
    name: "Stranger Things",
    symbol: "5",
    price: "$15.42K",
    volume: "$5.22K",
    marketCap: "$15.42K",
    change: "+266.41%",
    change5m: "-0.47%",
    change1h: "+266.41%",
    change6h: "+266.41%",
    isPositive: true,
    chartData: [12, 13, 14, 15, 16, 18, 20, 22, 24, 26],
    bondingCurve: 90,
    ath: "$15.5K",
    age: "9m",
    txns: 59,
    traders: 5,
    image: "/stranger.png" // Placeholder
  },
  {
    id: 6,
    name: "Phone Wojak",
    symbol: "PHONEWOJAK",
    price: "$184.27K",
    volume: "$1.72M",
    marketCap: "$184.27K",
    change: "+2,762.70%",
    change5m: "+1.37%",
    change1h: "-86.10%",
    change6h: "+2,762.70%",
    isPositive: true,
    chartData: [10, 20, 15, 30, 25, 40, 35, 50, 45, 60],
    bondingCurve: 85,
    ath: "$184.5K",
    age: "2h",
    txns: 10348,
    traders: 2537,
    image: "/wojak.png" // Placeholder
  },
   {
    id: 7,
    name: "Anna",
    symbol: "Anna",
    price: "$6.55K",
    volume: "$61.17K",
    marketCap: "$6.55K",
    change: "+55.92%",
    change5m: "-52.77%",
    change1h: "-25.77%",
    change6h: "+55.92%",
    isPositive: true,
    chartData: [30, 28, 32, 35, 38, 36, 34, 32, 30, 28],
    bondingCurve: 25,
    ath: "$15.9K",
    age: "1h",
    txns: 1522,
    traders: 363,
    image: "/anna.png" // Placeholder
  },
];

const Sparkline = ({ data, isPositive }: { data: number[]; isPositive: boolean }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 30;
  const width = 80;
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
      <defs>
        <linearGradient id={`gradient-${isPositive ? 'pos' : 'neg'}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.2" />
            <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? "#10b981" : "#ef4444"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
       <polygon
        points={`${points} ${width},${height} 0,${height}`}
        fill={`url(#gradient-${isPositive ? 'pos' : 'neg'})`}
        stroke="none"
      />
    </svg>
  );
};

export default function MarketTicker() {
  const [activeTab, setActiveTab] = useState("Spot");
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");

  return (
    <div className="w-full max-w-[1800px] mx-auto mt-8 px-6 pb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
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
        
        <div className="flex items-center bg-[var(--card-bg)] rounded-lg p-1 border border-[var(--border-color)]">
            <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                    ? "bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
            >
                <List size={18} />
            </button>
            <button
                onClick={() => setViewMode("cards")}
                className={`p-2 rounded-md transition-colors ${
                    viewMode === "cards"
                    ? "bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
            >
                <LayoutGrid size={18} />
            </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] p-6 overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[1200px] border-collapse">
                <thead>
                <tr className="text-left text-xs text-[var(--muted)] border-b border-[var(--border-color)]">
                    <th className="pb-4 pl-4 font-medium uppercase">Coin</th>
                    <th className="pb-4 font-medium text-center uppercase">Graph</th>
                    <th className="pb-4 font-medium text-right uppercase">Mcap</th>
                    <th className="pb-4 font-medium text-left pl-8 uppercase">ATH</th>
                    <th className="pb-4 font-medium text-center uppercase">Age</th>
                    <th className="pb-4 font-medium text-right uppercase">Txns</th>
                    <th className="pb-4 font-medium text-right uppercase">24h Vol</th>
                    <th className="pb-4 font-medium text-right uppercase">Traders</th>
                    <th className="pb-4 font-medium text-right uppercase">5M</th>
                    <th className="pb-4 font-medium text-right uppercase">1H</th>
                    <th className="pb-4 font-medium text-right uppercase">6H</th>
                    <th className="pb-4 font-medium text-right pr-4 uppercase">24H</th>
                </tr>
                </thead>
                <tbody>
                {markets.map((market, index) => (
                    <tr
                    key={market.id}
                    className="border-b border-[var(--border-color)] last:border-none hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer h-16"
                    >
                    <td className="pl-4">
                        <div className="flex items-center gap-3">
                        <span className="text-[var(--muted)] text-sm w-4">#{index + 1}</span>
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-[var(--foreground)] overflow-hidden">
                            {/* Placeholder for image */}
                            {market.symbol[0]}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-[var(--foreground)]">
                            {market.name}
                            </div>
                            <div className="text-xs text-[var(--muted)]">
                            {market.symbol}
                            </div>
                        </div>
                        </div>
                    </td>
                    <td className="text-center">
                        <div className="flex justify-center">
                            <Sparkline
                                data={market.chartData}
                                isPositive={market.isPositive}
                            />
                        </div>
                    </td>
                    <td className="text-right text-sm font-medium text-[var(--foreground)]">
                        {market.marketCap}
                    </td>
                    <td className="pl-8">
                        <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-[var(--input-bg)] rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${market.bondingCurve > 80 ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-emerald-400'}`}
                                    style={{ width: `${market.bondingCurve}%` }}
                                ></div>
                            </div>
                            <span className="text-sm font-medium text-[var(--foreground)]">{market.ath}</span>
                        </div>
                    </td>
                    <td className="text-center text-sm text-[var(--foreground)]">
                        {market.age}
                    </td>
                    <td className="text-right text-sm text-[var(--foreground)]">
                        {market.txns}
                    </td>
                    <td className="text-right text-sm text-[var(--foreground)]">
                        {market.volume}
                    </td>
                    <td className="text-right text-sm text-[var(--foreground)]">
                        {market.traders}
                    </td>
                    <td className={`text-right text-sm font-medium ${market.change5m.startsWith('+') ? 'text-emerald-500' : market.change5m === '-' ? 'text-[var(--muted)]' : 'text-red-500'}`}>
                        {market.change5m}
                    </td>
                    <td className={`text-right text-sm font-medium ${market.change1h.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                        {market.change1h}
                    </td>
                    <td className={`text-right text-sm font-medium ${market.change6h.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                        {market.change6h}
                    </td>
                    <td className={`text-right text-sm font-medium pr-4 ${market.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                        {market.change}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {markets.map((market) => (
                <div key={market.id} className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 hover:border-blue-500/50 transition-colors cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-bold text-[var(--foreground)]">
                                {market.symbol[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-[var(--foreground)]">{market.name}</h3>
                                <p className="text-sm text-[var(--muted)]">{market.symbol}</p>
                            </div>
                        </div>
                        <div className={`text-sm font-bold ${market.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                            {market.change}
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-[var(--muted)]">Market Cap</span>
                            <span className="font-medium text-[var(--foreground)]">{market.marketCap}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-[var(--muted)]">Age</span>
                            <span className="font-medium text-[var(--foreground)]">{market.age}</span>
                        </div>
                        
                        <div className="pt-2">
                            <div className="flex justify-between text-xs text-[var(--muted)] mb-1">
                                <span>Bonding Curve</span>
                                <span className={market.bondingCurve > 80 ? 'text-amber-400' : 'text-emerald-400'}>{market.bondingCurve}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-[var(--input-bg)] rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${market.bondingCurve > 80 ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-emerald-400'}`}
                                    style={{ width: `${market.bondingCurve}%` }}
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
