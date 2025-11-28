"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Users, TrendingUp, Star, Share2, Bell, MoreVertical, Clock, Eye, MessageCircle, DollarSign, ChevronDown } from "lucide-react";
import { useState } from "react";
import { livestreams } from "@/lib/livestreamData";

interface LivestreamViewPageProps {
  streamId: string;
}

export default function LivestreamViewPage({ streamId }: LivestreamViewPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"chat" | "info">("info");
  
  const stream = livestreams.find(s => s.id === streamId);

  if (!stream) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Stream not found</h2>
          <button 
            onClick={() => router.push("/livestream")}
            className="text-blue-500 hover:text-blue-400 transition-colors font-medium"
          >
            Go back to livestreams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-10">
      {/* Header / Breadcrumb */}
      <div className="border-b border-[var(--border-color)] bg-[var(--background)]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center">
          <button
            onClick={() => router.push("/livestream")}
            className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors group text-sm font-medium"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Livestreams</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Video Player and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-[var(--border-color)] shadow-2xl group">
              <iframe
                src={stream.videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              
              {/* Live Indicator Overlay */}
              {stream.isLive && (
                <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-md px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-bold text-white shadow-lg animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  LIVE
                </div>
              )}
            </div>

            {/* Stream Title and Actions */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2 leading-tight">
                  {stream.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
                  <div className="flex items-center gap-1.5 text-red-500 font-medium">
                    <Eye size={16} />
                    <span>{stream.viewers.toLocaleString()} watching</span>
                  </div>
                  {stream.startedAt && (
                    <>
                      <span className="w-1 h-1 bg-[var(--muted)] rounded-full"></span>
                      <div className="flex items-center gap-1.5">
                        <Clock size={16} />
                        <span>Started {stream.startedAt}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button className="h-9 px-4 rounded-lg bg-[var(--input-bg)] hover:bg-[var(--border-color)] flex items-center gap-2 text-sm font-medium transition-colors border border-[var(--border-color)]">
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
                <button className="h-9 w-9 rounded-lg bg-[var(--input-bg)] hover:bg-[var(--border-color)] flex items-center justify-center transition-colors border border-[var(--border-color)]">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Streamer Info & Tabs */}
            <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
               {/* Streamer Header */}
              <div className="p-4 flex items-center justify-between border-b border-[var(--border-color)]">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
                      {stream.streamer.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--foreground)]">{stream.streamer}</h3>
                      <p className="text-xs text-[var(--muted)]">{stream.streamerHandle}</p>
                    </div>
                 </div>
                 <button className="px-4 py-1.5 bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 rounded-lg text-sm font-semibold transition-opacity">
                    Follow
                 </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[var(--border-color)]">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === "info"
                      ? "text-[var(--foreground)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  Information
                  {activeTab === "info" && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === "chat"
                      ? "text-[var(--foreground)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  Live Chat
                   {activeTab === "chat" && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>
                  )}
                </button>
              </div>

              <div className="p-6 min-h-[200px]">
                {activeTab === "info" ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--foreground)] mb-2">About this stream</h4>
                      <p className="text-sm text-[var(--muted)] leading-relaxed">
                        {stream.description || "No description available for this stream."}
                      </p>
                    </div>
                    {stream.tags && stream.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap pt-2">
                        {stream.tags.map((tag, idx) => (
                            <span 
                            key={idx}
                            className="px-2.5 py-1 bg-[var(--input-bg)] rounded-md text-xs text-[var(--muted)] border border-[var(--border-color)]"
                            >
                            #{tag}
                            </span>
                        ))}
                        </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[var(--muted)] py-8">
                    <MessageCircle size={32} className="mb-2 opacity-50" />
                    <p className="text-sm">Chat is currently disabled</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats and Trading */}
          <div className="space-y-6">
            {/* Market Stats Card */}
            <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-5">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-500" />
                Market Statistics
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[var(--input-bg)] rounded-lg border border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-md text-green-500">
                            <Users size={16} />
                        </div>
                        <span className="text-sm text-[var(--muted)]">Viewers</span>
                    </div>
                    <span className="text-sm font-bold text-[var(--foreground)]">{stream.viewers}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[var(--input-bg)] rounded-lg border border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-md text-blue-500">
                            <TrendingUp size={16} />
                        </div>
                        <span className="text-sm text-[var(--muted)]">Market Cap</span>
                    </div>
                    <span className="text-sm font-bold text-[var(--foreground)]">{stream.marketCap}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[var(--input-bg)] rounded-lg border border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-md text-purple-500">
                            <Star size={16} />
                        </div>
                        <span className="text-sm text-[var(--muted)]">ATH</span>
                    </div>
                    <span className="text-sm font-bold text-[var(--foreground)]">{stream.ath}</span>
                </div>
              </div>
            </div>

            {/* Trading Panel */}
            <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
              <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
                 <h3 className="text-sm font-semibold text-[var(--foreground)]">Trade</h3>
                 <div className="flex gap-2">
                    <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded">Long</span>
                    <span className="text-xs bg-[var(--input-bg)] text-[var(--muted)] px-2 py-0.5 rounded">Short</span>
                 </div>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-[var(--muted)] mb-1.5">
                    <label>Amount</label>
                    <span>Balance: 0.00 SOL</span>
                  </div>
                  <div className="bg-[var(--input-bg)] rounded-lg px-3 py-2.5 border border-[var(--border-color)] flex items-center gap-2 focus-within:border-blue-500 transition-colors">
                    <input
                      type="text"
                      placeholder="0.00"
                      className="bg-transparent border-none outline-none text-[var(--foreground)] w-full font-mono text-sm"
                    />
                    <div className="flex items-center gap-1 pl-2 border-l border-[var(--border-color)]">
                        <span className="text-xs font-bold text-[var(--foreground)]">SOL</span>
                        <ChevronDown size={12} className="text-[var(--muted)]" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="py-2.5 bg-green-500 hover:bg-green-600 rounded-lg font-semibold text-sm text-white transition-colors shadow-lg shadow-green-500/20">
                    Buy
                  </button>
                  <button className="py-2.5 bg-red-500 hover:bg-red-600 rounded-lg font-semibold text-sm text-white transition-colors shadow-lg shadow-red-500/20">
                    Sell
                  </button>
                </div>

                <div className="pt-4 border-t border-[var(--border-color)]">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-[var(--muted)]">
                      <span>Entry Price</span>
                      <span className="text-[var(--foreground)] font-mono">-</span>
                    </div>
                    <div className="flex justify-between text-[var(--muted)]">
                      <span>Liquidation Price</span>
                      <span className="text-[var(--foreground)] font-mono">-</span>
                    </div>
                     <div className="flex justify-between text-[var(--muted)]">
                      <span>Est. Fee</span>
                      <span className="text-[var(--foreground)] font-mono">0.00 SOL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bonding Curve Progress */}
            <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Bonding Curve</h3>
                <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">100%</span>
              </div>
              <div className="w-full h-2 bg-[var(--input-bg)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full w-full"></div>
              </div>
              <p className="text-xs text-[var(--muted)] mt-3">
                This coin has graduated from the bonding curve and is now trading on the open market.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
