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
  getDocs,
  setDoc,
  serverTimestamp,
  getDoc,
  limit,
  collectionGroup,
} from "firebase/firestore";
import {
  Loader2,
  Shield,
  Power,
  Eye,
  EyeOff,
  DollarSign,
  Activity,
  Users,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [platformStats, setPlatformStats] = useState<any>({
    totalEarnings: 0,
    totalTransactions: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [adminWallet, setAdminWallet] = useState("");
  const [isSavingWallet, setIsSavingWallet] = useState(false);

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
      // Check if email is in the allowed list
      if (ADMIN_EMAILS.includes(email)) {
        setIsAdmin(true);
        toast.success("Welcome Admin!");
      } else {
        setIsAdmin(false);
        toast.error("Access Denied: You are not an authorized admin.");
        await signOut(auth);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      toast.error("Failed to verify admin status.");
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
      const tokensData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTokens(tokensData);
    });

    // Fetch Platform Stats
    const statsRef = doc(db, "platform_stats", "global");
    const unsubStats = onSnapshot(statsRef, (doc) => {
        if (doc.exists()) {
            setPlatformStats(doc.data());
            setAdminWallet(doc.data().adminWalletAddress || "");
        } else {
            // Initialize if not exists
            setDoc(statsRef, { totalEarnings: 0, totalTransactions: 0 });
        }
    });

    // Fetch Recent Transactions (using collectionGroup for 'trades' subcollection)
    const qTrades = query(collectionGroup(db, "trades"), orderBy("timestamp", "desc"), limit(10));
    const unsubTrades = onSnapshot(qTrades, (snapshot) => {
        const trades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentTransactions(trades);
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

  const handleLogout = () => signOut(auth);

  const handleSaveWallet = async () => {
      if (!adminWallet) return;
      setIsSavingWallet(true);
      try {
          await updateDoc(doc(db, "platform_stats", "global"), {
              adminWalletAddress: adminWallet
          });
          toast.success("Admin wallet updated!");
      } catch (error) {
          console.error("Error saving wallet:", error);
          toast.error("Failed to save wallet.");
      } finally {
          setIsSavingWallet(false);
      }
  };

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <Loader2 className="animate-spin text-[var(--primary)]" />
      </div>
    );

  if (!user || !isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] text-[var(--foreground)]">
        <Shield size={48} className="text-[var(--primary)]" />
        <h1 className="text-2xl font-bold">Admin Access Only</h1>
        <p className="text-[var(--muted)] max-w-md text-center">
          This area is restricted to platform administrators. Only the first 3
          registered accounts are granted access.
        </p>
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="text-[var(--primary)]" /> Admin Dashboard
            </h1>
            <p className="text-[var(--muted)] mt-1">
              Manage platform settings and view statistics
            </p>
          </div>
          <div className="flex items-center gap-4 bg-[var(--card-bg)] p-2 rounded-lg border border-[var(--border-color)]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.displayName}</span>
              <span className="text-xs text-[var(--muted)]">{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="ml-4 p-2 hover:bg-red-500/10 text-red-500 rounded-md transition-colors"
              title="Sign out"
            >
              <Power size={18} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[var(--muted)] font-medium">
                Total Earnings
              </h3>
              <DollarSign className="text-green-500" />
            </div>
            <div className="text-3xl font-bold">
              {(platformStats.totalEarnings || 0).toLocaleString()} ADA
            </div>
            <div className="text-sm text-green-500 mt-2">
              +12% from last month
            </div>
          </div>

          <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[var(--muted)] font-medium">
                Total Transactions
              </h3>
              <Activity className="text-blue-500" />
            </div>
            <div className="text-3xl font-bold">
              {(platformStats.totalTransactions || 0).toLocaleString()}
            </div>
            <div className="text-sm text-blue-500 mt-2">+5% from last week</div>
          </div>

          <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[var(--muted)] font-medium">Active Admins</h3>
              <Users className="text-purple-500" />
            </div>
            <div className="text-3xl font-bold">3 / 3</div>
            <div className="text-sm text-[var(--muted)] mt-2">
              Max limit reached
            </div>
          </div>
        </div>

        {/* Admin Wallet Settings */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">Admin Wallet Settings</h3>
            <div className="flex gap-4">
                <input 
                    type="text" 
                    value={adminWallet}
                    onChange={(e) => setAdminWallet(e.target.value)}
                    placeholder="Enter Admin Wallet Address (addr...)"
                    className="flex-1 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-2 outline-none focus:border-blue-500 transition-colors"
                />
                <button 
                    onClick={handleSaveWallet}
                    disabled={isSavingWallet}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {isSavingWallet ? "Saving..." : "Save Address"}
                </button>
            </div>
            <p className="text-xs text-[var(--muted)] mt-2">
                This address will receive all platform fees (1 ADA per mint, transaction fees).
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Token Management */}
          <div className="lg:col-span-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden">
            <div className="p-6 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-bold">Token Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--input-bg)] border-b border-[var(--border-color)]">
                    <th className="p-4 font-medium text-sm text-[var(--muted)]">
                      Token
                    </th>
                    <th className="p-4 font-medium text-sm text-[var(--muted)]">
                      Status
                    </th>
                    <th className="p-4 font-medium text-sm text-[var(--muted)]">
                      Raised
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token) => (
                    <tr
                      key={token.id}
                      className="border-b border-[var(--border-color)] hover:bg-[var(--input-bg)]/50 transition-colors"
                    >
                      <td className="p-4 flex items-center gap-3">
                        {token.image && (
                          <img
                            src={token.image}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-bold text-sm">{token.name}</div>
                          <div className="text-xs text-[var(--muted)]">
                            {token.symbol}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            token.status === "LIVE"
                              ? "bg-green-500/20 text-green-500"
                              : token.status === "DISABLED"
                                ? "bg-red-500/20 text-red-500"
                                : "bg-blue-500/20 text-blue-500"
                          }`}
                        >
                          {token.status || "FUNDING"}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        {token.raisedAda || 0} ADA
                      </td>
                    </tr>
                  ))}
                  {tokens.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-8 text-center text-[var(--muted)]"
                      >
                        No tokens found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden h-fit">
            <div className="p-6 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-bold">Recent Activity</h2>
            </div>
            <div className="p-4 space-y-4">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--input-bg)]/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        tx.type === "buy"
                          ? "bg-green-500/20 text-green-500"
                          : tx.type === "sell"
                            ? "bg-red-500/20 text-red-500"
                            : "bg-blue-500/20 text-blue-500"
                      }`}
                    >
                      {tx.type ? tx.type[0].toUpperCase() : "?"}
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {tx.type === 'buy' ? 'Bought' : 'Sold'} {tx.amountAda} ADA
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        {tx.account ? `${tx.account.slice(0, 6)}...` : "Unknown"}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-[var(--muted)]">{formatTimeAgo(tx.timestamp)}</div>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                  <div className="text-center text-[var(--muted)] text-sm py-4">No recent activity</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
