"use client";

import { ArrowUp, ArrowDown } from "lucide-react";

const newMarkets = [
  {
    symbol: "MON-PERP",
    price: "$0.037338",
    change: "-15.39%",
    isPositive: false,
  },
  { symbol: "ZRO-PERP", price: "$1.35", change: "+2.82%", isPositive: true },
  {
    symbol: "PAXG-PERP",
    price: "$4,184.47",
    change: "+0.82%",
    isPositive: true,
  },
  { symbol: "MET-PERP", price: "$0.3387", change: "-4.16%", isPositive: false },
  {
    symbol: "PIPE-PERP",
    price: "$0.06508",
    change: "+0.82%",
    isPositive: true,
  },
];

const topMovers = [
  {
    symbol: "MON-PERP",
    price: "$0.037338",
    change: "-15.39%",
    isPositive: false,
  },
  {
    symbol: "BERA-PERP",
    price: "$0.9476",
    change: "-8.55%",
    isPositive: false,
  },
  { symbol: "2Z-PERP", price: "$0.11494", change: "-8.51%", isPositive: false },
  { symbol: "ZEC-PERP", price: "$472.33", change: "-7.78%", isPositive: false },
  { symbol: "JTO-PERP", price: "$0.5002", change: "-5.75%", isPositive: false },
];

const popular = [
  {
    symbol: "BTC-PERP",
    price: "$91,443.20",
    change: "+0.00%",
    isPositive: true,
  },
  {
    symbol: "ETH-PERP",
    price: "$3,022.44",
    change: "-0.47%",
    isPositive: false,
  },
  { symbol: "BNB-PERP", price: "$896.84", change: "+0.21%", isPositive: true },
  { symbol: "SOL-PERP", price: "$140.23", change: "-1.96%", isPositive: false },
  {
    symbol: "MON-PERP",
    price: "$0.037338",
    change: "-15.39%",
    isPositive: false,
  },
];

const StatCard = ({
  title,
  data,
}: {
  title: string;
  data: typeof newMarkets;
}) => (
  <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 flex-1">
    <div className="flex justify-between items-center mb-4 text-xs text-[var(--muted)] font-medium">
      <span>{title}</span>
      <span>24h Change</span>
    </div>
    <div className="space-y-3">
      {data.map((item, index) => (
        <div
          key={index}
          className="flex justify-between items-center group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] text-[var(--foreground)] font-bold">
              {item.symbol[0]}
            </div>
            <span className="text-sm font-medium text-[var(--foreground)] group-hover:text-blue-500 transition-colors">
              {item.symbol}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--foreground)] font-medium">
              {item.price}
            </span>
            <span
              className={`text-sm font-medium ${item.isPositive ? "text-emerald-500" : "text-red-500"}`}
            >
              {item.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function MarketStats() {
  return (
    <div className="w-full max-w-[1400px] mx-auto mt-6 px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="New" data={newMarkets} />
        <StatCard title="Top Movers" data={topMovers} />
        <StatCard title="Popular" data={popular} />
      </div>
    </div>
  );
}
