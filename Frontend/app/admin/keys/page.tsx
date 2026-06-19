"use client";

import { useState, useEffect } from "react";
import { auth } from "../../../lib/firebase"; // Note the path
import { ADMIN_EMAILS } from "@/lib/constants";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  Loader2,
  Shield,
  Key,
  Copy,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { AdminSidebar } from "@/components/AdminSidebar";
import { fetchEnvironmentKeys } from "./action";

interface EnvKey {
  key: string;
  value: string;
  isSensitive: boolean;
}

export default function KeysPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [envKeys, setEnvKeys] = useState<EnvKey[]>([]);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

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
        await loadKeys(email);
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

  const loadKeys = async (email: string) => {
    try {
      const keys = await fetchEnvironmentKeys(email);
      setEnvKeys(keys);
    } catch (error) {
      console.error("Error fetching variables:", error);
      toast.error("Failed to fetch environment variables.");
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Login failed");
    }
  };

  const toggleVisibility = (key: string) => {
    setVisibleKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const copyToClipboard = (text: string, keyName: string) => {
    if (!text) {
        toast.error(`Value for ${keyName} is empty!`);
        return;
    }
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyAllToClipboard = () => {
    const allKeysText = envKeys
      .map((k) => `${k.key}=${k.value}`)
      .join("\n");
    navigator.clipboard.writeText(allKeysText);
    setCopiedAll(true);
    toast.success("All environment variables copied to clipboard");
    setTimeout(() => setCopiedAll(false), 2000);
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
      
      <main className="p-4 lg:p-8 space-y-8 max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl flex items-center gap-3">
              <Key className="text-blue-500" size={32} />
              System Keys
            </h1>
            <p className="mt-2 text-[var(--muted)] font-medium">
              Manage and view sensitive environment configurations securely.
            </p>
          </div>
          <button
            onClick={copyAllToClipboard}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95"
          >
            {copiedAll ? <Check size={18} /> : <Copy size={18} />}
            {copiedAll ? "Copied All!" : "Copy All Keys"}
          </button>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
           <div className="p-6 border-b border-[var(--border-color)] bg-[var(--input-bg)]/30">
               <h2 className="text-lg font-bold">Environment Variables</h2>
           </div>
           <div className="p-6 space-y-4">
             {envKeys.map((env) => {
               const isVisible = visibleKeys[env.key];
               const displayValue = isVisible 
                  ? env.value 
                  : (env.value ? "•••••••••••••••••••••••••••••" : "Not Set");

               return (
                 <div key={env.key} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)]/20 hover:border-blue-500/30 transition-all group">
                   <div className="flex-1">
                     <p className="text-sm font-bold text-[var(--foreground)] font-mono mb-1">
                        {env.key}
                     </p>
                     <div className="flex items-center gap-2">
                        {env.isSensitive && <span className="text-[10px] bg-red-500/10 text-red-500 font-bold px-2 py-0.5 rounded-full uppercase">Sensitive</span>}
                        <span className="text-[10px] bg-blue-500/10 text-blue-500 font-bold px-2 py-0.5 rounded-full uppercase">Production & Preview</span>
                     </div>
                   </div>
                   
                   <div className="flex items-center gap-3 bg-[var(--background)] px-4 py-2 rounded-lg border border-[var(--border-color)] lg:w-1/2 justify-between">
                     <span className={`font-mono text-sm truncate max-w-[200px] lg:max-w-xs ${!env.value && "text-[var(--muted)] italic"}`}>
                        {displayValue}
                     </span>
                     <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        {env.value && (
                            <button
                                onClick={() => toggleVisibility(env.key)}
                                className="p-2 hover:bg-[var(--input-bg)] rounded-md text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                            >
                                {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        )}
                        <button
                            onClick={() => copyToClipboard(env.value, env.key)}
                            className="p-2 hover:bg-[var(--input-bg)] rounded-md text-[var(--muted)] hover:text-blue-500 transition-colors"
                        >
                            {copiedKey === env.key ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                     </div>
                   </div>
                 </div>
               );
             })}
           </div>
        </div>
      </main>
    </div>
  );
}
