"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, ImageIcon } from "lucide-react";
import { Meme } from "@/lib/meme";

interface BentoGridProps {
  memes: Meme[];
  filterType: "all" | "images" | "videos";
}

export default function BentoGrid({ memes, filterType }: BentoGridProps) {
  const [filteredMemes, setFilteredMemes] = useState<Meme[]>([]);

  useEffect(() => {
    if (filterType === "all") {
      setFilteredMemes(memes);
    } else if (filterType === "images") {
      setFilteredMemes(memes.filter((m) => m.type === "image" || m.type === "gif"));
    } else {
      setFilteredMemes(memes.filter((m) => m.type === "video"));
    }
  }, [memes, filterType]);

  // Masonry layout using CSS columns
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
      {filteredMemes.map((meme) => (
        <div
          key={meme.id}
          className="break-inside-avoid group relative bg-[var(--card-bg)]/50 backdrop-blur-md rounded-2xl overflow-hidden border border-[var(--border-color)] hover:border-violet-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1"
        >
          {/* Media Content */}
          <div className="relative w-full">
            {meme.type === "video" ? (
              <div className="relative w-full">
                <video
                  src={meme.data}
                  controls
                  className="w-full h-auto object-contain bg-black/5"
                  preload="metadata"
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur text-white p-1.5 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={14} fill="currentColor" />
                </div>
              </div>
            ) : (
              <div className="relative w-full">
                <Image
                  src={meme.data}
                  alt="Meme"
                  width={500}
                  height={500}
                  className="w-full h-auto object-contain"
                  loading="lazy"
                  unoptimized
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ImageIcon size={14} />
                </div>
              </div>
            )}

            {/* Hover Overlay with Info & Actions */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <div className="flex items-end justify-between">
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-white text-sm font-medium truncate">
                    {meme.fileName || "Untitled Meme"}
                  </p>
                  <p className="text-white/70 text-xs truncate mt-0.5 font-mono">
                    {meme.uploadedBy.slice(0, 6)}...{meme.uploadedBy.slice(-4)}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button 
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-colors"
                    title="Download"
                    onClick={(e) => {
                      e.stopPropagation();
                      const link = document.createElement('a');
                      link.href = meme.data;
                      link.download = meme.fileName || `meme-${meme.id}.${meme.type === 'video' ? 'mp4' : 'png'}`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
