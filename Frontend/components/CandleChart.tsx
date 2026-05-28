"use client";

import { createChart, ColorType, UTCTimestamp, CandlestickSeriesPartialOptions, CandlestickSeries } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

interface CandleChartProps {
    data: {
        time: number;
        open: number;
        high: number;
        low: number;
        close: number;
    }[];
}

export default function CandleChart({ data }: CandleChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#9ca3af',
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.2)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.2)' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
        });

        // In v5, use addSeries method with CandlestickSeries
        const seriesOptions: CandlestickSeriesPartialOptions = {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        };

        const candlestickSeries = chart.addSeries(CandlestickSeries, seriesOptions);

        // Convert data to proper format with UTCTimestamp
        const formattedData = data
            .sort((a, b) => a.time - b.time)
            .filter((item, index, self) =>
                index === self.findIndex((t) => t.time === item.time)
            )
            .map(item => ({
                time: item.time as UTCTimestamp,
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
            }));

        candlestickSeries.setData(formattedData);

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data]);

    return (
        <div ref={chartContainerRef} className="w-[80%] mt-10 h-full" />
    );
}
