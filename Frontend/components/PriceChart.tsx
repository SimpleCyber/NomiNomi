"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface PriceChartProps {
  data: {
    timestamp: number;
    price: number;
  }[];
}

export default function PriceChart({ data }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="timestamp"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString()}
          tick={{ fontSize: 10, fill: "var(--muted)" }}
        />
        <YAxis
          domain={["auto", "auto"]}
          tick={{ fontSize: 10, fill: "var(--muted)" }}
          tickFormatter={(value) => value.toFixed(2)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--border-color)",
            borderRadius: "0.5rem",
          }}
          itemStyle={{ color: "var(--foreground)" }}
          labelStyle={{ display: "none" }}
          formatter={(value: number) => [`${value.toFixed(6)} ADA`, "Price"]}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke="#22c55e"
          fillOpacity={1}
          fill="url(#colorPrice)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
