"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { ADMIN_EMAILS } from "@/lib/constants";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  limit,
  collectionGroup,
} from "firebase/firestore";
import {
  Loader2,
  Shield,
  DollarSign,
  Activity,
  Users,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  History,
  Settings as SettingsIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AdminSidebar } from "@/components/AdminSidebar";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [platformStats, setPlatformStats] = useState<any>({
    totalEarnings: 0,
    totalTransactions: 0,
    adminEmail: "",
    platformFee: 1, // 1% default
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [adminWallet, setAdminWallet] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState<"dashboard" | "tokens" | "settings">("dashboard");
  const [solanaNetwork, setSolanaNetwork] = useState<"devnet" | "mainnet-beta">("devnet");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        await checkAdminStatus(currentUser.email);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const checkAdminStatus = async (email: string) => {
    try {
      if (ADMIN_EMAILS.includes(email)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        toast.error("Access Denied: You are not an authorized admin.");
        await signOut(auth);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !isAdmin) return;

    // Fetch Tokens
    const q = query(collection(db, "memecoins"), orderBy("createdAt", "desc"));
    const unsubTokens = onSnapshot(q, (snapshot) => {
      setTokens(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Platform Stats
    const statsRef = doc(db, "platform_stats", "global");
    const unsubStats = onSnapshot(statsRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            setPlatformStats(data);
            setAdminWallet(data.adminWalletAddress || "");
            setAdminEmail(data.adminEmail || "");
            setSolanaNetwork(data.solanaNetwork || "devnet");
        } else {
            setDoc(statsRef, { totalEarnings: 0, totalTransactions: 0 });
        }
    });

    // Fetch Recent Transactions
    const qTrades = query(collectionGroup(db, "trades"), orderBy("timestamp", "desc"), limit(6));
    const unsubTrades = onSnapshot(qTrades, (snapshot) => {
        setRecentTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
        unsubTokens();
        unsubStats();
        unsubTrades();
    };
  }, [user, isAdmin]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Login failed");
    }
  };

  const handleSaveSettings = async () => {
      setIsSaving(true);
      try {
          await updateDoc(doc(db, "platform_stats", "global"), {
              adminWalletAddress: adminWallet,
              adminEmail: adminEmail,
              solanaNetwork: solanaNetwork,
          });
          toast.success("Platform settings updated successfully!");
      } catch (error) {
          toast.error("Failed to update settings.");
      } finally {
          setIsSaving(false);
      }
  };

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[var(--background)]">
      <Loader2 className="animate-spin text-blue-500" />
    </div>
  );

  if (!user || !isAdmin) return (
    <div className="flex h-screen flex-col items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
        <Shield size={32} />
      </div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Admin Restricted</h1>
      <p className="text-[var(--muted)] text-center max-w-sm mb-8">
        This area is reserved for platform administrators only. If you believe this is an error, please contact support.
      </p>
      <button
        onClick={handleLogin}
        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 active:scale-95"
      >
        Authorize via Google
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] lg:pl-64">
      <AdminSidebar onLogout={() => signOut(auth)} user={user} />
      
      <main className="p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Platform Overview
            </h1>
            <p className="mt-2 text-[var(--muted)] font-medium">
              Real-time synchronization with Solana and Metadata Extensions
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--border-color)] px-4 py-2 rounded-xl">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-xs font-bold text-[var(--foreground)]">System Operational</span>
          </div>
        </div>

        {/* Dynamic Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { label: "Total Revenue", value: `${(platformStats.totalEarnings || 0).toLocaleString()} SOL`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Total Sales", value: (platformStats.totalTransactions || 0).toLocaleString(), icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Active Tokens", value: tokens.length.toLocaleString(), icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
            { label: "Admin Access", value: (ADMIN_EMAILS.length).toLocaleString(), icon: Users, color: "text-orange-500", bg: "bg-orange-500/10" },
          ].map((stat, i) => (
            <div key={i} className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border-color)] group hover:border-[var(--primary)] transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">+0%</span>
              </div>
              <p className="text-sm font-medium text-[var(--muted)]">{stat.label}</p>
              <h3 className="text-2xl font-bold text-[var(--foreground)] mt-1">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="xl:col-span-2 space-y-8">
            {/* Admin Controls / Settings */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-blue-500/5 rotate-12">
                   <SettingsIcon size={120} />
                </div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <SettingsIcon size={20} className="text-blue-500" /> Infrastructure Settings
                </h2>
                <div className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Admin Payout Wallet (SOL)</label>
                            <input 
                                type="text" 
                                value={adminWallet}
                                onChange={(e) => setAdminWallet(e.target.value)}
                                placeholder="Solana Public Key (Token-2022 Fees)"
                                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Admin Email Address</label>
                            <input 
                                type="email" 
                                value={adminEmail}
                                onChange={(e) => setAdminEmail(e.target.value)}
                                placeholder="admin@nominomi.com"
                                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            />
                        </div>
                    </div>

                    {/* Network Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)]/30">
                        <div className="flex gap-3 items-center">
                            <div className={`w-3 h-3 rounded-full ${solanaNetwork === "devnet" ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`}></div>
                            <div>
                                <p className="text-sm font-bold text-[var(--foreground)]">
                                    Solana Network: <span className={solanaNetwork === "devnet" ? "text-yellow-500" : "text-green-500"}>{solanaNetwork === "devnet" ? "Devnet" : "Mainnet"}</span>
                                </p>
                                <p className="text-[10px] text-[var(--muted)]">
                                    {solanaNetwork === "devnet" ? "Testing mode — no real SOL is used" : "Production mode — real SOL transactions"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSolanaNetwork(solanaNetwork === "devnet" ? "mainnet-beta" : "devnet")}
                            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${solanaNetwork === "mainnet-beta" ? "bg-green-500" : "bg-yellow-500"}`}
                        >
                            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${solanaNetwork === "mainnet-beta" ? "translate-x-7" : "translate-x-0.5"}`}></div>
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                        <div className="flex gap-3 items-center">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                                %
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[var(--foreground)]">Current Platform Cut: 5% Supply + 1% Trade</p>
                                <p className="text-[10px] text-[var(--muted)]">Calculated on-chain via SPL Token-2022 Metadata Extensions</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleSaveSettings}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50"
                        >
                            {isSaving ? "Syncing..." : "Update Infrastructure"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Token Table */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--input-bg)]/30">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Activity size={20} className="text-purple-500" /> Managed Assets
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={14} />
                        <input type="text" placeholder="Search tokens..." className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg pl-9 pr-4 py-1.5 text-xs outline-none focus:border-blue-500 w-48" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] border-b border-[var(--border-color)]">
                                <th className="px-6 py-4">Mint / Asset</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4">Performance (SOL)</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                            {tokens.map((token) => (
                                <tr key={token.id} className="hover:bg-blue-500/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--input-bg)] overflow-hidden border border-[var(--border-color)]">
                                                {token.image ? <img src={token.image} className="w-full h-full object-cover" /> : null}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-[var(--foreground)]">{token.name}</p>
                                                <p className="text-xs text-[var(--muted)] font-mono">{token.mintAddress?.slice(0,4)}...{token.mintAddress?.slice(-4)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                                token.status === "MINTED" ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"
                                            }`}>
                                                {token.status || "CREATING"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">{token.raisedSOL || 0}</span>
                                            <span className="text-xs text-[var(--muted)]">SOL</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 rounded-lg hover:bg-[var(--card-bg)] text-[var(--muted)] hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all">
                                            <ExternalLink size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>

          {/* Right Column: Real-time Feed */}
          <div className="space-y-8">
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-[var(--border-color)]">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <History size={20} className="text-blue-500" /> Live Tape
                    </h2>
                </div>
                <div className="p-3 space-y-3">
                    {recentTransactions.map((tx) => (
                        <div key={tx.id} className="p-4 rounded-xl bg-[var(--input-bg)]/40 border border-transparent hover:border-[var(--border-color)] transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                    tx.type === "buy" ? "bg-green-500 text-black" : "bg-red-500 text-white"
                                }`}>
                                    {tx.type}
                                </div>
                                <span className="text-[10px] text-[var(--muted)]">{formatTimeAgo(tx.timestamp)}</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                   <p className="text-xs font-bold text-[var(--foreground)]">{tx.amountAda} SOL</p>
                                   <p className="text-[10px] text-[var(--muted)] truncate max-w-[120px]">{tx.account}</p>
                                </div>
                                <ChevronRight className="text-[var(--muted)]" size={12} />
                            </div>
                        </div>
                    ))}
                    <button className="w-full py-3 text-xs font-bold text-[var(--muted)] hover:text-blue-500 transition-colors">
                        View All On-Chain History
                    </button>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
