"use client";

import { useState } from "react";
import { ArrowRightLeft, TrendingUp } from "lucide-react";

interface TradePanelProps {
    coinSymbol: string;
    coinName: string;
    coinImage: string;
}

export default function TradePanel({ coinSymbol, coinName, coinImage }: TradePanelProps) {
    const [mode, setMode] = useState<"buy" | "sell">("buy");
    const [amount, setAmount] = useState("");

    return (
        <div className="flex flex-col h-full bg-[#141519] border border-gray-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-[#1a1b1f] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src={coinImage} alt={coinSymbol} className="w-6 h-6 rounded-full" />
                    <span className="font-bold text-white">{coinSymbol}</span>
                </div>
                <div className="flex items-center gap-1 text-green-500 text-xs font-medium bg-green-500/10 px-2 py-1 rounded">
                    <TrendingUp size={12} />
                    <span>+12.5%</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-[#0f1012] m-3 rounded-lg">
                <button
                    onClick={() => setMode("buy")}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === "buy" ? "bg-green-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                        }`}
                >
                    Buy
                </button>
                <button
                    onClick={() => setMode("sell")}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === "sell" ? "bg-red-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                        }`}
                >
                    Sell
                </button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>Amount ({mode === "buy" ? "ADA" : coinSymbol})</span>
                        <span>Balance: 0.00</span>
                    </div>
                    <div className="relative">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-[#0f1012] border border-gray-700 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-green-500 transition-colors"
                            placeholder="0.00"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 bg-gray-800 px-2 py-1 rounded">
                            {mode === "buy" ? "ADA" : coinSymbol}
                        </div>
                    </div>
                </div>

                {/* Quick Amounts */}
                <div className="flex gap-2">
                    {["0.1", "0.5", "1", "5"].map((val) => (
                        <button
                            key={val}
                            onClick={() => setAmount(val)}
                            className="flex-1 bg-[#1a1b1f] hover:bg-gray-700 border border-gray-700 rounded py-1 text-xs text-gray-300 transition-colors"
                        >
                            {val} {mode === "buy" ? "ADA" : "%"}
                        </button>
                    ))}
                </div>

                {/* Info */}
                <div className="bg-[#1a1b1f] rounded-lg p-3 space-y-2 text-xs">
                    <div className="flex justify-between text-gray-400">
                        <span>You receive</span>
                        <span className="text-white font-bold">0.00 {mode === "buy" ? coinSymbol : "ADA"}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                        <span>Price impact</span>
                        <span className="text-green-500">&lt; 0.1%</span>
                    </div>
                </div>

                <button className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition-transform active:scale-95 ${mode === "buy"
                        ? "bg-green-600 hover:bg-green-500 shadow-green-900/20"
                        : "bg-red-600 hover:bg-red-500 shadow-red-900/20"
                    }`}>
                    {mode === "buy" ? "Place Buy Order" : "Place Sell Order"}
                </button>
            </div>

            {/* Bonding Curve */}
            <div className="mt-auto p-4 border-t border-gray-800">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Bonding Curve Progress</span>
                    <span className="text-green-400">45%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-600 to-green-400 w-[45%]" />
                </div>
                <p className="text-[10px] text-gray-500 mt-2">
                    When the market cap reaches $69k, all liquidity is deposited to Raydium and burned.
                </p>
            </div>
        </div>
    );
}
