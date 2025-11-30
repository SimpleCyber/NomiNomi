"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import BentoGrid from "@/components/BentoGrid";
import MemeUpload from "@/components/MemeUpload";
import { Plus, Loader2 } from "lucide-react";
import { subscribeMemes, Meme } from "@/lib/meme";
import { useWallet } from "@/context/WalletContext";

export default function FunPage() {
    const [activeTab, setActiveTab] = useState<"all" | "images" | "videos">("all");
    const [memes, setMemes] = useState<Meme[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const { isConnected } = useWallet();

    useEffect(() => {
        // Subscribe to real-time meme updates
        const unsubscribe = subscribeMemes((updatedMemes) => {
            setMemes(updatedMemes);
            setIsLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return (
        <div className="flex min-h-screen bg-[var(--background)]">
            <Sidebar />

            <div className="flex-1 flex flex-col ml-0 md:ml-[var(--sidebar-width)] transition-all duration-300">
                <Navbar />

                <div className="p-6 md:p-8 relative">
                    {/* Background Blobs */}
                    <div className="absolute top-0 left-0 w-full h-96 bg-violet-500/5 blur-[100px] pointer-events-none" />
                    
                    <div className="max-w-[1600px] mx-auto relative z-10">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-[var(--foreground)] tracking-tight mb-3">
                                    Have <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">Fun</span>
                                </h1>
                                <p className="text-[var(--muted)] text-lg max-w-md">
                                    The community meme stash. Upload, share, and vibe with the best clips and images.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                {/* Filter Tabs */}
                                <div className="flex bg-[var(--card-bg)]/50 backdrop-blur-sm p-1.5 rounded-2xl border border-[var(--border-color)] shadow-sm">
                                    {(["all", "images", "videos"] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${activeTab === tab
                                                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25 scale-105"
                                                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)]"
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                {/* Upload Button */}
                                <button
                                    onClick={() => setIsUploadModalOpen(true)}
                                    disabled={!isConnected}
                                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold hover:shadow-lg hover:shadow-violet-500/25 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                                    title={!isConnected ? "Connect wallet to upload" : "Upload meme"}
                                >
                                    <Plus size={20} strokeWidth={2.5} />
                                    <span className="hidden sm:inline">Upload Meme</span>
                                </button>
                            </div>
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="animate-spin text-violet-500 mb-4" size={48} />
                                <p className="text-[var(--muted)]">Loading memes...</p>
                            </div>
                        )}

                        {/* Bento Grid */}
                        {!isLoading && <BentoGrid memes={memes} filterType={activeTab} />}
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            <MemeUpload
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSuccess={() => {
                    // Real-time subscription will automatically update the grid
                }}
            />
        </div>
    );
}
