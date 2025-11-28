"use client";

interface SparklineProps {
  data: number[];
  isPositive: boolean;
}

export const Sparkline = ({ data, isPositive }: SparklineProps) => {
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

  const color = isPositive ? "var(--success)" : "var(--error)";

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient
          id={`gradient-${isPositive ? "pos" : "neg"}`}
          x1="0"
          x2="0"
          y1="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor={color}
            stopOpacity="0.2"
          />
          <stop
            offset="100%"
            stopColor={color}
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`${points} ${width},${height} 0,${height}`}
        fill={`url(#gradient-${isPositive ? "pos" : "neg"})`}
        stroke="none"
      />
    </svg>
  );
};
