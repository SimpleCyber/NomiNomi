"use client";

import { MARKET_STATS, MarketStatItem } from "@/data/constants";

const StatCard = ({
  title,
  data,
}: {
  title: string;
  data: MarketStatItem[];
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
        <StatCard title="New" data={MARKET_STATS.new} />
        <StatCard title="Top Movers" data={MARKET_STATS.topMovers} />
        <StatCard title="Popular" data={MARKET_STATS.popular} />
      </div>
    </div>
  );
}
