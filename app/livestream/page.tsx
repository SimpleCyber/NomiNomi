"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useLiveStream } from "@/context/LiveStreamContext";
import { Users, Play, Radio } from "lucide-react";
import Sidebar from "@/components/Sidebar";

interface Stream {
  id: string;
  channel: string;
  hostAddress: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  coinImage: string;
  viewerCount: number;
  startedAt: any;
}

export default function LiveStreamPage() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const { joinStream } = useLiveStream();

  useEffect(() => {
    // Listen for active streams
    const q = query(collection(db, "active_streams"), orderBy("startedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const streamList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Stream[];
      setStreams(streamList);
    });

    return () => unsubscribe();
  }, []);

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-[var(--sidebar-width)] transition-all duration-300 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)] flex items-center gap-3">
                Live Streams
              </h1>
              <p className="text-[var(--muted)] mt-2">
                Discover active streams from coin creators and the community.
              </p>
            </div>
            <div className="bg-[var(--card-bg)] px-4 py-2 rounded-full border border-[var(--border-color)] text-sm font-medium text-[var(--foreground)]">
              {streams.length} Active {streams.length === 1 ? "Stream" : "Streams"}
            </div>
          </div>

          {/* Grid */}
          {streams.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="w-24 h-24 bg-[var(--card-bg)] rounded-full flex items-center justify-center mb-6 border border-[var(--border-color)]">
                <Radio size={40} className="text-[var(--muted)]" />
              </div>
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">No Active Streams</h2>
              <p className="text-[var(--muted)] max-w-md">
                There are no live streams right now. Be the first to go live by creating a coin!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {streams.map((stream) => (
                <div
                  key={stream.id}
                  onClick={() => joinStream(stream.channel, {
                    id: stream.coinId,
                    name: stream.coinName,
                    symbol: stream.coinSymbol,
                    image: stream.coinImage
                  })}
                  className="group relative bg-[var(--card-bg)] rounded-xl overflow-hidden border border-[var(--border-color)] hover:border-violet-500/50 transition-all cursor-pointer hover:shadow-2xl hover:shadow-violet-500/10"
                >
                  {/* Thumbnail Area */}
                  <div className="aspect-video relative bg-black/50 overflow-hidden">
                    <img
                      src={stream.coinImage}
                      alt={stream.coinName}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Live Badge */}
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-lg">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      LIVE
                    </div>

                    {/* Time Badge */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1 border border-white/10">
                      {formatTimeAgo(stream.startedAt)}
                    </div>

                    {/* Viewer Count */}
                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 border border-white/10">
                      <Users size={12} />
                      {stream.viewerCount || 0}
                    </div>
                  </div>

                  {/* Info Area */}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--background)] p-0.5 border border-[var(--border-color)] shrink-0">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${stream.hostAddress}`}
                          alt="Host"
                          className="w-full h-full rounded-full bg-gray-800"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[var(--foreground)] truncate group-hover:text-violet-500 transition-colors">
                          {stream.coinName} Launch
                        </h3>
                        <p className="text-xs text-[var(--muted)] truncate">
                          by {stream.hostAddress.slice(0, 6)}...{stream.hostAddress.slice(-4)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[10px] font-medium bg-[var(--background)] border border-[var(--border-color)] px-1.5 py-0.5 rounded text-[var(--muted)]">
                            {stream.coinSymbol}
                          </span>
                          <span className="text-[10px] font-medium bg-[var(--background)] border border-[var(--border-color)] px-1.5 py-0.5 rounded text-[var(--muted)]">
                            Crypto
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                      <Play size={24} fill="currentColor" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
