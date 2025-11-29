"use client";

import { useState, useEffect } from "react";
import { Copy, ExternalLink, Search, Loader2, LayoutGrid, List } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useWallet } from "@/context/WalletContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import EditProfileModal from "@/components/EditProfileModal";
import { initLucid } from "@/lib/cardano";
import CoinDisplay from "@/components/CoinDisplay";
import ViewCreatedCoinModal from "@/components/ViewCreatedCoinModal";

export default function ProfilePage() {
    const { isConnected, walletAddress, walletName } = useWallet();
    const [activeTab, setActiveTab] = useState("Balances");
    const [userData, setUserData] = useState<any>(null);
    const [balance, setBalance] = useState<string>("0.00");
    const [createdCoins, setCreatedCoins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState<any>(null);
    const [isViewCoinModalOpen, setIsViewCoinModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "cards">("list");

    const tabs = [
        "Balances",
        "Replies",
        "Notifications",
        "Coin Created",
        "Coin Held",
    ];

    const fetchData = async () => {
        if (!walletAddress) {
            setLoading(false);
            return;
        }

        try {
            // Fetch User Data
            const userRef = doc(db, "users", walletAddress);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setUserData(userSnap.data());
            }

            // Fetch Created Coins
            // Assuming 'memecoins' collection has a 'creatorAddress' field
            const q = query(collection(db, "memecoins"), where("creatorAddress", "==", walletAddress));
            const querySnapshot = await getDocs(q);
            const coins = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCreatedCoins(coins);

        } catch (error) {
            console.error("Error fetching profile data:", error);
            toast.error("Failed to load profile data.");
        } finally {
            setLoading(false);
        }
    };

    const fetchBalance = async () => {
        if (walletName && (window as any).cardano) {
            try {
                const api = await (window as any).cardano[walletName].enable();
                const lucid = await initLucid(api);
                const utxos = await lucid.wallet.getUtxos();
                const lovelace = utxos.reduce((acc, u) => acc + u.assets.lovelace, 0n);
                setBalance((Number(lovelace) / 1_000_000).toFixed(2));
            } catch (err) {
                console.error("Error fetching balance:", err);
            }
        }
    };

    useEffect(() => {
        if (isConnected) {
            fetchData();
            fetchBalance();
        } else {
            setLoading(false);
        }
    }, [isConnected, walletAddress]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    const handleCoinClick = (coin: any) => {
        setSelectedCoin(coin);
        setIsViewCoinModalOpen(true);
    };

    if (!isConnected) {
        return (
            <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans">
                <Sidebar />
                <div className="flex flex-col min-h-screen md:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-in-out">
                    <Navbar />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-4">Please connect your wallet</h2>
                            <p className="text-[var(--muted)]">Connect your wallet to view your profile.</p>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans">
                <Sidebar />
                <div className="flex flex-col min-h-screen md:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-in-out">
                    <Navbar />
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="animate-spin w-10 h-10 text-[var(--primary)]" />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans">
            <Sidebar />
            <div className="flex flex-col min-h-screen md:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-in-out">
                <Navbar />
                <div className="flex-1 overflow-y-auto px-4 py-6">
                    <div className="max-w-4xl mx-auto">

                        {/* Profile Header */}
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-green-900 border-2 border-green-500/20">
                                    {/* Placeholder Avatar - could be dynamic later */}
                                    <div className="w-full h-full flex items-center justify-center text-3xl">
                                        🐸
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold mb-1">{userData?.username || "Anonymous User"}</h1>
                                    <div className="flex items-center gap-2 text-sm text-[var(--muted)] bg-[var(--input-bg)] px-2 py-1 rounded-md w-fit">
                                        <span>{walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</span>
                                        <button onClick={() => copyToClipboard(walletAddress || "")} className="hover:text-[var(--foreground)]">
                                            <Copy size={14} />
                                        </button>
                                        <a 
                                            href={`https://cardanoscan.io/address/${walletAddress}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 hover:text-[var(--foreground)] ml-2"
                                        >
                                            View on Cardanoscan <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsEditModalOpen(true)}
                                className="bg-[var(--input-bg)] hover:bg-[var(--border-color)] text-[var(--foreground)] px-6 py-2 rounded-md font-medium transition-colors border border-[var(--border-color)]"
                            >
                                Edit Profile
                            </button>
                        </div>

                        <EditProfileModal 
                            isOpen={isEditModalOpen}
                            onClose={() => setIsEditModalOpen(false)}
                            currentUsername={userData?.username || ""}
                            walletAddress={walletAddress || ""}
                            onUpdate={fetchData}
                        />

                        <ViewCreatedCoinModal
                            isOpen={isViewCoinModalOpen}
                            onClose={() => setIsViewCoinModalOpen(false)}
                            coin={selectedCoin}
                        />

                        {/* Stats */}
                        <div className="flex gap-8 mb-10 text-sm">
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-lg">{userData?.followers || 0}</span>
                                <span className="text-[var(--muted)]">Followers</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-lg">{userData?.following || 0}</span>
                                <span className="text-[var(--muted)]">Following</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-lg">{createdCoins.length}</span>
                                <span className="text-[var(--muted)]">Created coins</span>
                            </div>
                        </div>

                        {/* Tabs & View Toggle */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--border-color)] mb-6">
                            <div className="flex gap-6 overflow-x-auto min-w-max pb-3 md:pb-0">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === tab
                                            ? "text-green-500"
                                            : "text-[var(--muted)] hover:text-[var(--foreground)]"
                                            }`}
                                    >
                                        {tab}
                                        {activeTab === tab && (
                                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 rounded-t-full" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* View Toggle - Only show for relevant tabs */}
                            {(activeTab === "Coin Created" || activeTab === "Coin Held") && (
                                <div className="flex items-center bg-[var(--card-bg)] rounded-lg p-1 border border-[var(--border-color)] mb-2 md:mb-0 self-end md:self-auto">
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-2 rounded-md transition-colors ${
                                            viewMode === "list"
                                                ? "bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm"
                                                : "text-[var(--muted)] hover:text-[var(--foreground)]"
                                        }`}
                                    >
                                        <List size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("cards")}
                                        className={`p-2 rounded-md transition-colors ${
                                            viewMode === "cards"
                                                ? "bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm"
                                                : "text-[var(--muted)] hover:text-[var(--foreground)]"
                                        }`}
                                    >
                                        <LayoutGrid size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[300px]">
                            {activeTab === "Balances" && (
                                <div>
                                    <div className="flex justify-between text-sm text-[var(--muted)] mb-4 px-2">
                                        <span>Coins</span>
                                        <span>Value</span>
                                    </div>
                                    {/* Placeholder for ADA Balance - Real balance fetching would go here */}
                                    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 flex items-center justify-between hover:bg-[var(--input-bg)] transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center overflow-hidden">
                                                <img
                                                    src="https://cryptologos.cc/logos/cardano-ada-logo.png"
                                                    alt="ADA"
                                                    className="w-6 h-6 object-contain"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-bold text-[var(--foreground)] group-hover:text-green-500 transition-colors">
                                                    Cardano (ADA)
                                                </div>
                                                <div className="text-sm text-[var(--muted)]">{balance} ADA</div>
                                            </div>
                                        </div>
                                        <div className="font-bold text-[var(--foreground)]">
                                            {/* Approximate USD value (placeholder rate) */}
                                            ${(parseFloat(balance) * 0.4).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "Coin Created" && (
                                <CoinDisplay 
                                    coins={createdCoins} 
                                    onCoinClick={handleCoinClick}
                                    emptyMessage="No coins created yet."
                                    viewMode={viewMode}
                                />
                            )}

                            {activeTab === "Coin Held" && (
                                <CoinDisplay 
                                    coins={[]} // Placeholder for held coins
                                    onCoinClick={handleCoinClick} // Assuming we might want to view details for held coins too
                                    emptyMessage="No coins held yet."
                                    viewMode={viewMode}
                                />
                            )}

                            {activeTab !== "Balances" && activeTab !== "Coin Created" && activeTab !== "Coin Held" && (
                                <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
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
