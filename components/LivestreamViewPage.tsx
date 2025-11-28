"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Users, TrendingUp, Star, Share2, Bell, MoreVertical, Clock, Eye, MessageCircle, ThumbsUp, DollarSign } from "lucide-react";
import { useState } from "react";
import { livestreams, type LivestreamData } from "@/lib/livestreamData";

interface LivestreamViewPageProps {
  streamId: string;
}

export default function LivestreamViewPage({ streamId }: LivestreamViewPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"chat" | "info">("info");
  
  const stream = livestreams.find(s => s.id === streamId);

  if (!stream) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Stream not found</h2>
          <button 
            onClick={() => router.push("/livestream")}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Go back to livestreams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Back Button Header */}
      <div className=" border-[var(--border-color)] bg-[var(--background)] sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <button
            onClick={() => router.push("/livestream")}
            className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 group-hover:bg-black/10 dark:group-hover:bg-white/10 flex items-center justify-center transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span className="text-sm font-medium">Back to Livestreams</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Video Player and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-2xl">
              <iframe
                src={stream.videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              
              {/* Live Indicator Overlay */}
              {stream.isLive && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-red-500/50 text-white">
                  <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></span>
                  LIVE
                </div>
              )}
            </div>

            {/* Stream Title and Actions */}
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--border-color)]">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-2">
                    {stream.title}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
                    <div className="flex items-center gap-1.5">
                      <Eye size={16} />
                      <span>{stream.viewers} viewers</span>
                    </div>
                    {stream.startedAt && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                          <Clock size={16} />
                          <span>{stream.startedAt}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 rounded-lg bg-[var(--input-bg)] hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors border border-[var(--border-color)]">
                    <Share2 size={18} className="text-[var(--muted)]" />
                  </button>
                  <button className="w-10 h-10 rounded-lg bg-[var(--input-bg)] hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors border border-[var(--border-color)]">
                    <Bell size={18} className="text-[var(--muted)]" />
                  </button>
                  <button className="w-10 h-10 rounded-lg bg-[var(--input-bg)] hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors border border-[var(--border-color)]">
                    <MoreVertical size={18} className="text-[var(--muted)]" />
                  </button>
                </div>
              </div>

              {/* Streamer Info */}
              <div className="flex items-center gap-4 pt-4 border-t border-[var(--border-color)]">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg flex-shrink-0 text-white">
                  {stream.streamer.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--foreground)] text-lg">{stream.streamer}</h3>
                  <p className="text-sm text-[var(--muted)]">{stream.streamerHandle}</p>
                </div>
                <button className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-lg font-medium transition-all shadow-lg shadow-green-500/20 text-white">
                  Follow
                </button>
              </div>

              {/* Tags */}
              {stream.tags && stream.tags.length > 0 && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  {stream.tags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1.5 bg-[var(--input-bg)] hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-sm text-[var(--muted)] border border-[var(--border-color)] transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs for Info/Description */}
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] overflow-hidden">
              <div className="flex border-b border-[var(--border-color)]">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === "info"
                      ? "text-[var(--foreground)] bg-black/5 dark:bg-white/5 border-b-2 border-green-500"
                      : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  Information
                </button>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === "chat"
                      ? "text-[var(--foreground)] bg-black/5 dark:bg-white/5 border-b-2 border-green-500"
                      : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  Chat
                </button>
              </div>

              <div className="p-6">
                {activeTab === "info" ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">About this stream</h3>
                      <p className="text-[var(--muted)] leading-relaxed">
                        {stream.description || "No description available."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-[var(--muted)] py-8">
                    <MessageCircle size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Chat feature coming soon</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats and Trading */}
          <div className="space-y-6">
            {/* Market Stats */}
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--border-color)]">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Market Stats</h3>
              
              <div className="space-y-4">
                <div className="bg-[var(--input-bg)] rounded-xl p-4 border border-[var(--border-color)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Users size={20} className="text-green-400" />
                    </div>
                    <p className="text-sm text-[var(--muted)]">Current Viewers</p>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{stream.viewers}</p>
                </div>

                <div className="bg-[var(--input-bg)] rounded-xl p-4 border border-[var(--border-color)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp size={20} className="text-blue-400" />
                    </div>
                    <p className="text-sm text-[var(--muted)]">Market Cap</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{stream.marketCap}</p>
                </div>

                <div className="bg-[var(--input-bg)] rounded-xl p-4 border border-[var(--border-color)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Star size={20} className="text-purple-400" />
                    </div>
                    <p className="text-sm text-[var(--muted)]">All Time High</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-400">{stream.ath}</p>
                </div>
              </div>
            </div>

            {/* Trading Panel */}
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--border-color)]">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Trade</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[var(--muted)] mb-2 block">Amount</label>
                  <div className="bg-[var(--input-bg)] rounded-lg p-3 border border-[var(--border-color)] flex items-center gap-2">
                    <DollarSign size={18} className="text-[var(--muted)]" />
                    <input
                      type="text"
                      placeholder="0.00"
                      className="bg-transparent border-none outline-none text-[var(--foreground)] w-full"
                    />
                    <span className="text-sm text-[var(--muted)]">SOL</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg font-medium transition-all shadow-lg shadow-green-500/20 text-white">
                    Buy
                  </button>
                  <button className="px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg font-medium transition-all shadow-lg shadow-red-500/20 text-white">
                    Sell
                  </button>
                </div>

                <div className="pt-4 border-t border-[var(--border-color)]">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-[var(--muted)]">
                      <span>Position</span>
                      <span className="text-[var(--foreground)] font-medium">0 tokens</span>
                    </div>
                    <div className="flex justify-between text-[var(--muted)]">
                      <span>Profit/Loss</span>
                      <span className="text-green-400 font-medium">+$0.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bonding Curve Progress */}
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Bonding Curve Progress</h3>
                <span className="text-sm font-bold text-green-400">100.0%</span>
              </div>
              <div className="w-full h-2 bg-[var(--input-bg)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full" style={{ width: "100%" }}></div>
              </div>
              <p className="text-xs text-[var(--muted)] mt-2">Coin has graduated!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
