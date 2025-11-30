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

                <div className="p-6 md:p-8">
                    <div className="max-w-[1600px] mx-auto">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
                                    Have Fun
                                </h1>
                                <p className="text-[var(--muted)] text-sm max-w-md">
                                    The community meme stash. Upload, share, and vibe with the best clips and images.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* Filter Tabs */}
                                <div className="flex bg-[var(--card-bg)] p-1 rounded-lg border border-[var(--border-color)]">
                                    {(["all", "images", "videos"] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${activeTab === tab
                                                    ? "bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm"
                                                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
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
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                                    title={!isConnected ? "Connect wallet to upload" : "Upload meme"}
                                >
                                    <Plus size={18} />
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
