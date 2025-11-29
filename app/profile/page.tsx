"use client";

import { useState, useEffect } from "react";
import { Copy, ExternalLink, LayoutGrid, List, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import ViewCreatedCoinModal from "@/components/ViewCreatedCoinModal";
import { useWallet } from "@/context/WalletContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import EditProfileModal from "@/components/EditProfileModal";

// Dummy Data
const COINS_CREATED = [
    {
        id: 1,
        name: "Cardano",
        symbol: "ADA",
        image: "https://cryptologos.cc/logos/cardano-ada-logo.png",
        marketCap: "$15.2B",
        age: "6y",
        volume: "$350M",
        change: "+2.4%",
        description: "Proof-of-stake blockchain platform"
    },
    {
        id: 2,
        name: "Snek",
        symbol: "SNEK",
        image: "https://pbs.twimg.com/profile_images/1651662706342838274/j1a23d3o_400x400.jpg",
        marketCap: "$45M",
        age: "1y",
        volume: "$1.2M",
        change: "+15.7%",
        description: "The chillest meme coin on Cardano"
    },
    {
        id: 3,
        name: "Hosky",
        symbol: "HOSKY",
        image: "https://pbs.twimg.com/profile_images/1457806286762315778/0A5V0q0P_400x400.jpg",
        marketCap: "$12M",
        age: "2y",
        volume: "$500K",
        change: "-5.2%",
        description: "Premier low-quality meme coin"
    },
    {
        id: 4,
        name: "MinSwap",
        symbol: "MIN",
        image: "https://cryptologos.cc/logos/cardano-ada-logo.png", // Fallback/Generic
        marketCap: "$25M",
        age: "2y",
        volume: "$800K",
        change: "+1.1%",
        description: "Multi-pool decentralized exchange"
    }
];

const COINS_HELD = [
    {
        id: 1,
        name: "Solana",
        symbol: "SOL",
        image: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
        balance: "145.5 SOL",
        value: "$24,560.50",
        change: "+5.4%",
        allocation: "45%"
    },
    {
        id: 2,
        name: "Cardano",
        symbol: "ADA",
        image: "https://cryptologos.cc/logos/cardano-ada-logo.png",
        balance: "15,000 ADA",
        value: "$8,250.00",
        change: "+2.1%",
        allocation: "15%"
    },
    {
        id: 3,
        name: "Bitcoin",
        symbol: "BTC",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1200px-Bitcoin.svg.png",
        balance: "0.25 BTC",
        value: "$16,500.00",
        change: "-1.2%",
        allocation: "30%"
    },
    {
        id: 4,
        name: "Ethereum",
        symbol: "ETH",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/1200px-Ethereum-icon-purple.svg.png",
        balance: "1.5 ETH",
        value: "$4,800.00",
        change: "+0.8%",
        allocation: "10%"
    }
];

export default function ProfilePage() {
    const { isConnected, walletAddress } = useWallet();
    const [activeTab, setActiveTab] = useState("Balances");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [selectedCoin, setSelectedCoin] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Data states
    const [userData, setUserData] = useState<any>(null);
    const [createdCoins, setCreatedCoins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        if (isConnected) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [isConnected, walletAddress]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    // Helper to determine which data to show
    // Prioritize fetched data if available, otherwise fallback to dummy data for UI demo
    const getDataForTab = () => {
        switch (activeTab) {
            case "Coin Created":
                return createdCoins.length > 0 ? createdCoins : COINS_CREATED;
            case "Coin Held":
            case "Balances":
                return COINS_HELD;
            default:
                return [];
        }
    };

    const handleCoinClick = (coin: any) => {
        if (activeTab === "Coin Created") {
            setSelectedCoin(coin);
            setIsModalOpen(true);
        }
    };

    const currentData = getDataForTab();
    const isCryptoView = ["Balances", "Coin Created", "Coin Held"].includes(activeTab);

    if (!isConnected) {
        return (
            <main className="min-h-screen bg-[#0f1014] text-white font-sans">
                <Sidebar />
                <div className="flex flex-col min-h-screen md:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-in-out">
                    <Navbar />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-4">Please connect your wallet</h2>
                            <p className="text-gray-400">Connect your wallet to view your profile.</p>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-[#0f1014] text-white font-sans">
                <Sidebar />
                <div className="flex flex-col min-h-screen md:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-in-out">
                    <Navbar />
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="animate-spin w-10 h-10 text-green-500" />
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
                    <div className="max-w-6xl mx-auto">

                        {/* Profile Header */}
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-green-900 border-2 border-green-500/20">
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
                                <span className="font-bold text-lg">{createdCoins.length > 0 ? createdCoins.length : COINS_CREATED.length}</span>
                                <span className="text-[var(--muted)]">Created coins</span>
                            </div>
                        </div>

                        {/* Tabs & View Toggle */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[var(--border-color)] pb-2">
                            <div className="flex gap-6 overflow-x-auto pb-2 sm:pb-0">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab
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

                            {isCryptoView && (
                                <div className="flex items-center bg-[var(--input-bg)] rounded-lg p-1 border border-[var(--border-color)] self-start sm:self-auto">
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-2 rounded-md transition-colors ${viewMode === "list"
                                            ? "bg-[var(--secondary)] text-[var(--foreground)] shadow-sm"
                                            : "text-[var(--muted)] hover:text-[var(--foreground)]"
                                            }`}
                                    >
                                        <List size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-2 rounded-md transition-colors ${viewMode === "grid"
                                            ? "bg-[var(--secondary)] text-[var(--foreground)] shadow-sm"
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
                            {isCryptoView ? (
                                viewMode === "list" ? (
                                    // LIST VIEW
                                    <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[800px] border-collapse">
                                                <thead>
                                                    <tr className="text-left text-xs text-[var(--muted)] border-b border-[var(--border-color)]">
                                                        <th className="p-4 font-medium uppercase">Asset</th>
                                                        {activeTab === "Coin Created" ? (
                                                            <>
                                                                <th className="p-4 font-medium text-right uppercase">Market Cap</th>
                                                                <th className="p-4 font-medium text-right uppercase">Age</th>
                                                                <th className="p-4 font-medium text-right uppercase">Volume (24h)</th>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <th className="p-4 font-medium text-right uppercase">Balance</th>
                                                                <th className="p-4 font-medium text-right uppercase">Value</th>
                                                                <th className="p-4 font-medium text-right uppercase">Allocation</th>
                                                            </>
                                                        )}
                                                        <th className="p-4 font-medium text-right uppercase pr-6">Change (24h)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentData.map((item: any) => (
                                                        <tr
                                                            key={item.id}
                                                            onClick={() => handleCoinClick(item)}
                                                            className={`border-b border-[var(--border-color)] last:border-none hover:bg-[var(--input-bg)] transition-colors group h-16 ${activeTab === "Coin Created" ? "cursor-pointer" : ""}`}
                                                        >
                                                            <td className="pl-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-[var(--input-bg)] border border-[var(--border-color)] flex items-center justify-center overflow-hidden">
                                                                        <img
                                                                            src={item.image || "https://cryptologos.cc/logos/cardano-ada-logo.png"}
                                                                            alt={item.symbol}
                                                                            className="w-6 h-6 object-contain"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-bold text-[var(--foreground)] group-hover:text-green-500 transition-colors">
                                                                            {item.name}
                                                                        </div>
                                                                        <div className="text-xs text-[var(--muted)]">
                                                                            {item.symbol}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            {activeTab === "Coin Created" ? (
                                                                <>
                                                                    <td className="text-right text-sm text-[var(--foreground)] p-4">{item.marketCap || "-"}</td>
                                                                    <td className="text-right text-sm text-[var(--foreground)] p-4">{item.age || "-"}</td>
                                                                    <td className="text-right text-sm text-[var(--foreground)] p-4">{item.volume || "-"}</td>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <td className="text-right text-sm text-[var(--foreground)] p-4">{item.balance}</td>
                                                                    <td className="text-right text-sm text-[var(--foreground)] p-4">{item.value}</td>
                                                                    <td className="text-right text-sm text-[var(--foreground)] p-4">{item.allocation}</td>
                                                                </>
                                                            )}
                                                            <td className={`text-right text-sm font-medium p-4 pr-6 ${item.change?.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                                                                {item.change || "0%"}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    // GRID VIEW
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {currentData.map((item: any) => (
                                            <div
                                                key={item.id}
                                                onClick={() => handleCoinClick(item)}
                                                className={`bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-5 hover:border-green-500/50 transition-colors group ${activeTab === "Coin Created" ? "cursor-pointer" : ""}`}
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] flex items-center justify-center overflow-hidden">
                                                            <img
                                                                src={item.image || "https://cryptologos.cc/logos/cardano-ada-logo.png"}
                                                                alt={item.symbol}
                                                                className="w-8 h-8 object-contain"
                                                            />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-[var(--foreground)] group-hover:text-green-500 transition-colors">
                                                                {item.name}
                                                            </h3>
                                                            <p className="text-sm text-[var(--muted)]">
                                                                {item.symbol}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className={`flex items-center gap-1 text-sm font-bold ${item.change?.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                                                        {item.change?.startsWith("+") ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                        {item.change || "0%"}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    {activeTab === "Coin Created" ? (
                                                        <>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-[var(--muted)]">Market Cap</span>
                                                                <span className="font-medium text-[var(--foreground)]">{item.marketCap || "-"}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-[var(--muted)]">Volume (24h)</span>
                                                                <span className="font-medium text-[var(--foreground)]">{item.volume || "-"}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-[var(--muted)]">Age</span>
                                                                <span className="font-medium text-[var(--foreground)]">{item.age || "-"}</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-[var(--muted)]">Balance</span>
                                                                <span className="font-medium text-[var(--foreground)]">{item.balance}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-[var(--muted)]">Value</span>
                                                                <span className="font-medium text-[var(--foreground)]">{item.value}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-[var(--muted)]">Allocation</span>
                                                                <span className="font-medium text-[var(--foreground)]">{item.allocation}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                // Other Tabs (Replies, Notifications)
                                <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
                                    <div className="mb-4 text-4xl opacity-20">📭</div>
                                    <p>No {activeTab.toLowerCase()} yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Coin Details Modal */}
                <ViewCreatedCoinModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    coin={selectedCoin}
                />
            </div>
        </main>
    );
}
