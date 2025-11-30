"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Play, Image as ImageIcon, Heart, Share2, Download } from "lucide-react";

// Dummy Data for Gallery
const MEMES = [
    {
        id: 1,
        type: "image",
        src: "/memes/meme3.png",
    },
    {
        id: 2,
        type: "video",
        src: "/memes/meme2.mp4",
    },
    {
        id: 3,
        type: "video",
        src: "/memes/meme1.mp4",
    },
];

export default function FunPage() {
    const [activeTab, setActiveTab] = useState<"all" | "images" | "videos">("all");

    const filteredMemes = activeTab === "all"
        ? MEMES
        : MEMES.filter(meme => meme.type === activeTab.slice(0, -1)); // "images" -> "image", "videos" -> "video"

    return (
        <div className="flex min-h-screen bg-[var(--background)]">
            <Sidebar />

            <div className="flex-1 flex flex-col ml-0 md:ml-[var(--sidebar-width)] transition-all duration-300">
                <Navbar />

                <div className="p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-[var(--foreground)] flex items-center gap-3">
                                    Have Fun Gallery
                                </h1>
                                <p className="text-[var(--muted)] mt-2">
                                    Chill out with the best memes and clips from the community.
                                </p>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex bg-[var(--card-bg)] p-1 rounded-xl border border-[var(--border-color)] w-fit">
                                {(["all", "images", "videos"] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab
                                                ? "bg-violet-600 text-white shadow-lg"
                                                : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)]"
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Gallery Grid */}
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                            {filteredMemes.map((meme) => (
                                <div
                                    key={meme.id}
                                    className="break-inside-avoid group relative bg-[var(--card-bg)] rounded-2xl overflow-hidden border border-[var(--border-color)] hover:border-violet-500/50 transition-all hover:shadow-2xl hover:shadow-violet-500/10"
                                >
                                    {/* Media Content */}
                                    <div className="relative">
                                        {meme.type === "video" ? (
                                            <div className="relative aspect-video">
                                                <video
                                                    src={meme.src}
                                                    controls
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur text-white p-1.5 rounded-full">
                                                    <Play size={14} fill="currentColor" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <img
                                                    src={meme.src}
                                                    className="w-full h-auto object-cover"
                                                    loading="lazy"
                                                />
                                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur text-white p-1.5 rounded-full">
                                                    <ImageIcon size={14} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
