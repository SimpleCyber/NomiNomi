"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Loader2, Shield, Power, Eye, EyeOff } from "lucide-react";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if user is admin (simplified: check email domain or specific email)
        // In production, check a 'users' collection or custom claims
        // For now, allow anyone who logs in to see the dashboard but maybe restrict actions
        // Or just assume the owner will login
        setIsAdmin(true); 
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "memecoins"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const tokensData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTokens(tokensData);
    });

    return () => unsub();
  }, [user]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
      alert("Login failed");
    }
  };

  const handleLogout = () => signOut(auth);

  const toggleTokenStatus = async (tokenId: string, currentStatus: boolean) => {
    try {
      const tokenRef = doc(db, "memecoins", tokenId);
      await updateDoc(tokenRef, {
        isPaused: !currentStatus,
        status: !currentStatus ? "DISABLED" : "FUNDING" // Simplified logic
      });
    } catch (error) {
      console.error("Error updating token", error);
      alert("Failed to update token");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <Shield size={48} className="text-[var(--primary)]" />
        <h1 className="text-2xl font-bold">Admin Access</h1>
        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield /> Admin Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--muted)]">{user.email}</span>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 text-sm font-medium"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--input-bg)] border-b border-[var(--border-color)]">
                <th className="p-4 font-medium">Token</th>
                <th className="p-4 font-medium">Symbol</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Raised</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr key={token.id} className="border-b border-[var(--border-color)] hover:bg-[var(--input-bg)]/50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    {token.image && <img src={token.image} alt="" className="w-8 h-8 rounded-full object-cover" />}
                    <span className="font-bold">{token.name}</span>
                  </td>
                  <td className="p-4 text-[var(--muted)]">{token.symbol}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      token.status === "LIVE" ? "bg-green-500/20 text-green-500" :
                      token.status === "DISABLED" ? "bg-red-500/20 text-red-500" :
                      "bg-blue-500/20 text-blue-500"
                    }`}>
                      {token.status}
                    </span>
                  </td>
                  <td className="p-4">{token.raisedAda || 0} ADA</td>
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
                      {token.isPaused ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
