"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, TrendingUp, Star, Play, Sparkles, Clock, Eye } from "lucide-react";
import { livestreams, type LivestreamData } from "@/lib/livestreamData";

export default function LivestreamPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "live" | "recorded">("all");

  const filteredStreams = livestreams.filter(stream => {
    if (filter === "live") return stream.isLive;
    if (filter === "recorded") return !stream.isLive;
    return true;
  });

  
  const handleCardClick = (id: string) => {
    router.push(`/livestream/${id}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header with Gradient Background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 blur-3xl"></div>
        <div className="relative max-w-[1400px] mx-auto px-6 py-4">
        </div>
      </div>

      {/* Livestream Grid */}
      <div className="max-w-[1400px] mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredStreams.map((stream) => (
            <div
              key={stream.id}
              onClick={() => handleCardClick(stream.id)}
              className={`
                group relative bg-[var(--card-bg)] rounded-2xl overflow-hidden cursor-pointer
                transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl border border-[var(--border-color)] hover:border-green-500/50
              `}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
                <img 
                  src={stream.thumbnail} 
                  alt={stream.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Live Badge */}
                {stream.isLive && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-red-500 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold shadow-lg shadow-red-500/50">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </div>
                )}

                {/* Time Badge */}
                {stream.startedAt && (
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-medium border border-white/10">
                    <Clock size={12} className="text-white" />
                    <span className="text-white">{stream.startedAt}</span>
                  </div>
                )}

                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
                    <Play className="w-8 h-8 text-black fill-black ml-1" />
                  </div>
                </div>

                {/* Viewer Count */}
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-medium border border-white/10">
                  <Users size={12} className="text-green-400" />
                  <span className="text-green-400">{stream.viewers}</span>
                </div>
              </div>

              {/* Stream Info */}
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg flex-shrink-0 text-white">
                    {stream.streamer.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--foreground)] truncate mb-1 group-hover:text-green-400 transition-colors">
                      {stream.title}
                    </h3>
                    <p className="text-sm text-[var(--muted)] truncate">
                      {stream.streamer}
                    </p>
                    <p className="text-xs text-[var(--muted)] truncate">
                      {stream.streamerHandle}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs pt-3 border-t border-[var(--border-color)]">
                  <div>
                    <p className="text-[var(--muted)] mb-1">Market Cap</p>
                    <p className="text-green-400 font-bold text-sm">{stream.marketCap}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[var(--muted)] mb-1">ATH</p>
                    <p className="text-[var(--foreground)] font-bold text-sm">{stream.ath}</p>
                  </div>
                </div>

                {/* Tags */}
                {stream.tags && stream.tags.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {stream.tags.map((tag, idx) => (
                      <span 
                        key={idx}
                        className="px-2.5 py-1 bg-[var(--input-bg)] hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-xs text-[var(--muted)] border border-[var(--border-color)] transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-green-500/5 group-hover:via-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
