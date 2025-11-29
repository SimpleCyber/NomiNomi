"use client";

import { X, Youtube, ExternalLink, Users, DollarSign, Activity, Calendar, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { LiveStream } from "./LiveStream";
import { toast } from "sonner";

interface ViewCreatedCoinModalProps {
    isOpen: boolean;
    onClose: () => void;
    coin: any; // Using any for now to match the dummy data structure
}

export default function ViewCreatedCoinModal({ isOpen, onClose, coin }: ViewCreatedCoinModalProps) {
    const [isLive, setIsLive] = useState(false);
    const agoraAppId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const agoraToken = process.env.NEXT_PUBLIC_AGORA_TOKEN;

    if (!isOpen || !coin) return null;

    const handleGoLive = () => {
        if (!agoraAppId) {
            toast.error("Agora App ID is missing. Please configure it in .env.local");
            return;
        }
        // In Secure Mode, token is required.
        // If user switches back to testing mode (App ID only), they can leave token empty in env, 
        // but for now we pass whatever is there.
        setIsLive(true);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div
                className="bg-[#141519] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-800 bg-[#141519]/95 backdrop-blur shrink-0">
                    <div className="flex items-center gap-4">
                        {isLive && (
                            <button
                                onClick={() => setIsLive(false)}
                                className="mr-2 p-1 hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <ArrowLeft size={20} className="text-gray-400" />
                            </button>
                        )}
                        <div className="w-12 h-12 rounded-full bg-[#1a1b1f] border border-gray-700 flex items-center justify-center overflow-hidden">
                            <img
                                src={coin.image}
                                alt={coin.symbol}
                                className="w-8 h-8 object-contain"
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                {coin.name}
                                <span className="text-sm font-normal text-gray-400 bg-[#1a1b1f] px-2 py-0.5 rounded">
                                    {coin.symbol}
                                </span>
                            </h2>
                            <div className={`text-sm font-medium ${coin.change?.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                                {coin.change} Today
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-[#1a1b1f] rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {isLive ? (
                        <div className="h-[600px]">
                            <LiveStream
                                appId={agoraAppId!}
                                token={agoraToken || null}
                                channelName={coin.id.toString()}
                                onEndCall={() => setIsLive(false)}
                            />
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Description */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-400 uppercase mb-2">About</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    {coin.description || "No description available for this coin."}
                                </p>
                            </div>

                            {/* Key Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-[#1a1b1f] p-4 rounded-xl border border-gray-800/50">
                                    <div className="text-gray-500 mb-1 flex items-center gap-2">
                                        <DollarSign size={14} /> Market Cap
                                    </div>
                                    <div className="text-lg font-bold text-white">{coin.marketCap}</div>
                                </div>
                                <div className="bg-[#1a1b1f] p-4 rounded-xl border border-gray-800/50">
                                    <div className="text-gray-500 mb-1 flex items-center gap-2">
                                        <Activity size={14} /> Volume
                                    </div>
                                    <div className="text-lg font-bold text-white">{coin.volume}</div>
                                </div>
                                <div className="bg-[#1a1b1f] p-4 rounded-xl border border-gray-800/50">
                                    <div className="text-gray-500 mb-1 flex items-center gap-2">
                                        <Calendar size={14} /> Age
                                    </div>
                                    <div className="text-lg font-bold text-white">{coin.age}</div>
                                </div>
                                <div className="bg-[#1a1b1f] p-4 rounded-xl border border-gray-800/50">
                                    <div className="text-gray-500 mb-1 flex items-center gap-2">
                                        <Users size={14} /> Holders
                                    </div>
                                    <div className="text-lg font-bold text-white">1,234</div>
                                </div>
                            </div>

                            {/* Progress / Status */}
                            <div className="bg-[#1a1b1f] p-5 rounded-xl border border-gray-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-white">Bonding Curve Progress</span>
                                    <span className="text-sm font-bold text-green-400">85%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[85%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    When the bonding curve reaches 100%, the liquidity will be deposited into a DEX.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 pt-4">
                                <button
                                    onClick={handleGoLive}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-900/20"
                                >
                                    <Youtube size={24} />
                                    <span>Go Live Now</span>
                                </button>
                                <p className="text-center text-xs text-gray-500">
                                    Start a live stream to engage with your community directly.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
