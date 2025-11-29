"use client";

import { useState } from "react";
import { Copy, ExternalLink, Search } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("Balances");

    const tabs = [
        "Balances",
        "Replies",
        "Notifications",
        "Coin Created",
        "Coin Held",
    ];

    return (
        <main className="min-h-screen bg-[#0f1014] text-white font-sans">
            <Sidebar />
            <div className="flex flex-col min-h-screen md:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-in-out">
                <Navbar />
                <div className="flex-1 overflow-y-auto px-4 py-6">
                    <div className="max-w-4xl mx-auto">

                        {/* Profile Header */}
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-green-900 border-2 border-green-500/20">
                                    {/* Placeholder Avatar */}
                                    <div className="w-full h-full flex items-center justify-center text-3xl">
                                        🐸
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold mb-1">NomiNomi</h1>
                                    <div className="flex items-center gap-2 text-sm text-gray-400 bg-[#1a1b1f] px-2 py-1 rounded-md w-fit">
                                        <span>8zLQq...CdAi</span>
                                        <button className="hover:text-white">
                                            <Copy size={14} />
                                        </button>
                                        <a href="#" className="flex items-center gap-1 hover:text-white ml-2">
                                            View on solscan <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <button className="bg-[#1a1b1f] hover:bg-[#27272a] text-white px-6 py-2 rounded-md font-medium transition-colors">
                                edit
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-8 mb-10 text-sm">
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-lg">0</span>
                                <span className="text-gray-400">Followers</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-lg">0</span>
                                <span className="text-gray-400">Following</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-lg">0</span>
                                <span className="text-gray-400">Created coins</span>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-800 mb-6 overflow-x-auto">
                            <div className="flex gap-6 min-w-max">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === tab
                                            ? "text-green-400"
                                            : "text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        {tab}
                                        {activeTab === tab && (
                                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 rounded-t-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[300px]">
                            {activeTab === "Balances" && (
                                <div>
                                    <div className="flex justify-between text-sm text-gray-500 mb-4 px-2">
                                        <span>Coins</span>
                                        <span>Value</span>
                                    </div>
                                    <div className="bg-[#141519] rounded-xl p-4 flex items-center justify-between hover:bg-[#1a1b1f] transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-black border border-gray-800 flex items-center justify-center overflow-hidden">
                                                <img
                                                    src="https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png"
                                                    alt="SOL"
                                                    className="w-6 h-6 object-contain"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-green-400 transition-colors">
                                                    Solana balance
                                                </div>
                                                <div className="text-sm text-gray-500">0.00 SOL</div>
                                            </div>
                                        </div>
                                        <div className="font-bold text-white">$0</div>
                                    </div>
                                </div>
                            )}

                            {activeTab !== "Balances" && (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                    <div className="mb-4 text-4xl opacity-20">📭</div>
                                    <p>No {activeTab.toLowerCase()} yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
