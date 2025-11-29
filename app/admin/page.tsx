"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { ADMIN_EMAILS } from "@/lib/constants";
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDocs, setDoc, serverTimestamp, getDoc, limit } from "firebase/firestore";
import { Loader2, Shield, Power, Eye, EyeOff, DollarSign, Activity, Users } from "lucide-react";
import { toast } from "sonner";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [platformStats, setPlatformStats] = useState<any>({ totalEarnings: 0, totalTransactions: 0 });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

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

    // Mock Platform Stats (In real app, fetch from 'platform_stats' collection)
    setPlatformStats({
      totalEarnings: 12500, // Mock ADA
      totalTransactions: 142
    });

    // Mock Recent Transactions
    setRecentTransactions([
      { id: 1, type: "MINT", amount: 50, user: "addr1...xyz", time: "2 mins ago" },
      { id: 2, type: "BUY", amount: 120, user: "addr1...abc", time: "5 mins ago" },
      { id: 3, type: "SELL", amount: 45, user: "addr1...def", time: "12 mins ago" },
    ]);

    return () => unsubTokens();
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

  const toggleTokenStatus = async (tokenId: string, currentStatus: boolean) => {
    try {
      const tokenRef = doc(db, "memecoins", tokenId);
      await updateDoc(tokenRef, {
        isPaused: !currentStatus,
        status: !currentStatus ? "DISABLED" : "FUNDING" 
      });
      toast.success(`Token ${!currentStatus ? "disabled" : "enabled"}`);
    } catch (error) {
      console.error("Error updating token", error);
      toast.error("Failed to update token");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-[var(--background)]"><Loader2 className="animate-spin text-[var(--primary)]" /></div>;

  if (!user || !isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] text-[var(--foreground)]">
        <Shield size={48} className="text-[var(--primary)]" />
        <h1 className="text-2xl font-bold">Admin Access Only</h1>
        <p className="text-[var(--muted)] max-w-md text-center">
          This area is restricted to platform administrators. 
          Only the first 3 registered accounts are granted access.
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
            <p className="text-[var(--muted)] mt-1">Manage platform settings and view statistics</p>
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
              <h3 className="text-[var(--muted)] font-medium">Total Earnings</h3>
              <DollarSign className="text-green-500" />
            </div>
            <div className="text-3xl font-bold">{platformStats.totalEarnings.toLocaleString()} ADA</div>
            <div className="text-sm text-green-500 mt-2">+12% from last month</div>
          </div>
          
          <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[var(--muted)] font-medium">Total Transactions</h3>
              <Activity className="text-blue-500" />
            </div>
            <div className="text-3xl font-bold">{platformStats.totalTransactions.toLocaleString()}</div>
            <div className="text-sm text-blue-500 mt-2">+5% from last week</div>
          </div>

          <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[var(--muted)] font-medium">Active Admins</h3>
              <Users className="text-purple-500" />
            </div>
            <div className="text-3xl font-bold">3 / 3</div>
            <div className="text-sm text-[var(--muted)] mt-2">Max limit reached</div>
          </div>
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
                    <th className="p-4 font-medium text-sm text-[var(--muted)]">Token</th>
                    <th className="p-4 font-medium text-sm text-[var(--muted)]">Status</th>
                    <th className="p-4 font-medium text-sm text-[var(--muted)]">Raised</th>
                    <th className="p-4 font-medium text-sm text-[var(--muted)] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token) => (
                    <tr key={token.id} className="border-b border-[var(--border-color)] hover:bg-[var(--input-bg)]/50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        {token.image && <img src={token.image} alt="" className="w-8 h-8 rounded-full object-cover" />}
                        <div>
                          <div className="font-bold text-sm">{token.name}</div>
                          <div className="text-xs text-[var(--muted)]">{token.symbol}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          token.status === "LIVE" ? "bg-green-500/20 text-green-500" :
                          token.status === "DISABLED" ? "bg-red-500/20 text-red-500" :
                          "bg-blue-500/20 text-blue-500"
                        }`}>
                          {token.status || "FUNDING"}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{token.raisedAda || 0} ADA</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => toggleTokenStatus(token.id, token.isPaused)}
                          className={`p-2 rounded-lg transition-colors ${
                            token.isPaused 
                              ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" 
                              : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                          }`}
                          title={token.isPaused ? "Enable" : "Disable"}
                        >
                          {token.isPaused ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tokens.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-[var(--muted)]">
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
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--input-bg)]/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      tx.type === "BUY" ? "bg-green-500/20 text-green-500" :
                      tx.type === "SELL" ? "bg-red-500/20 text-red-500" :
                      "bg-blue-500/20 text-blue-500"
                    }`}>
                      {tx.type[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{tx.type} {tx.amount} ADA</div>
                      <div className="text-xs text-[var(--muted)]">{tx.user}</div>
                    </div>
                  </div>
                  <div className="text-xs text-[var(--muted)]">{tx.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
