"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, onSnapshot, collection, addDoc, query, orderBy, serverTimestamp, Timestamp } from "firebase/firestore";
import { useWallet } from "../context/WalletContext";
import { Loader2, ExternalLink, Globe, Twitter, Send, Copy, RefreshCw } from "lucide-react";
import Image from "next/image";
import { buyToken, launchLP } from "../lib/transactions";
import { toast } from "sonner";

interface Comment {
  id: string;
  text: string;
  sender: string;
  createdAt: any;
}

export default function TokenDetails({ tokenId }: { tokenId: string }) {
  const [token, setToken] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buyAmount, setBuyAmount] = useState("");
  const [isBuying, setIsBuying] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [activeTab, setActiveTab] = useState<"thread" | "trades">("thread");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const { isConnected, walletAddress } = useWallet();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "memecoins", tokenId), (doc) => {
      if (doc.exists()) {
        setToken({ id: doc.id, ...doc.data() });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [tokenId]);

  // Fetch Comments
  useEffect(() => {
    const q = query(
      collection(db, "memecoins", tokenId, "comments"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
      setComments(fetchedComments);
    });

    return () => unsub();
  }, [tokenId]);

  const handlePostComment = async () => {
    if (!isConnected) {
      toast.error("Please connect wallet to comment");
      return;
    }
    if (!commentText.trim()) return;

    setIsPosting(true);
    try {
      await addDoc(collection(db, "memecoins", tokenId, "comments"), {
        text: commentText.trim(),
        sender: walletAddress,
        createdAt: serverTimestamp(),
      });
      setCommentText("");
      toast.success("Comment posted!");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setIsPosting(false);
    }
  };

  const handleBuy = async () => {
    if (!isConnected) {
      toast.error("Please connect wallet");
      return;
    }

    setIsBuying(true);
    try {
      const cardano = (window as any).cardano;
      const walletName = cardano.nami ? "nami" : "eternl";
      const walletApi = await cardano[walletName].enable();

      const txHash = await buyToken(walletApi, token, parseFloat(buyAmount));
      console.log("Buy Tx:", txHash);
      toast.success("Buy transaction submitted!");
      setBuyAmount("");
    } catch (error) {
      console.error("Buy failed:", error);
      toast.error("Buy failed. See console.");
    } finally {
      setIsBuying(false);
    }
  };

  const handleLaunchLP = async () => {
    if (!isConnected) return;
    setIsLaunching(true);
    try {
      const cardano = (window as any).cardano;
      const walletName = cardano.nami ? "nami" : "eternl";
      const walletApi = await cardano[walletName].enable();

      const txHash = await launchLP(walletApi, token);
      console.log("LP Launch Tx:", txHash);
      toast.success("LP Launch submitted!");
    } catch (error) {
      console.error("LP Launch failed:", error);
      toast.error("LP Launch failed.");
    } finally {
      setIsLaunching(false);
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
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin text-[var(--muted)]" />
      </div>
    );
  if (!token) return <div className="p-8 text-center text-[var(--muted)]">Token not found</div>;

  const progress = Math.min(((token.raisedAda || 0) / 5) * 100, 100);

  return (
    <div className="max-w-[1400px] mx-auto p-4 lg:p-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[var(--input-bg)] flex-shrink-0">
            {token.image ? (
              <Image
                src={token.image}
                alt={token.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[var(--muted)]">
                {token.symbol?.[0]}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-[var(--foreground)]">{token.name}</h1>
              <span className="text-[var(--muted)]">({token.symbol})</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-3">
              <span>Created by</span>
              <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-500/50"></span>
                {token.creatorAddress?.slice(0, 6)}...{token.creatorAddress?.slice(-4)}
              </span>
              <span>•</span>
              <span>{token.age || "Just now"}</span>
            </div>
            <div className="flex gap-2 mb-3">
              {token.website && (
                <a href={token.website} target="_blank" className="p-1.5 bg-[var(--card-bg)] rounded hover:bg-[var(--border-color)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]">
                  <Globe size={14} />
                </a>
              )}
              {token.twitter && (
                <a href={token.twitter} target="_blank" className="p-1.5 bg-[var(--card-bg)] rounded hover:bg-[var(--border-color)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]">
                  <Twitter size={14} />
                </a>
              )}
              {token.telegram && (
                <a href={token.telegram} target="_blank" className="p-1.5 bg-[var(--card-bg)] rounded hover:bg-[var(--border-color)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]">
                  <Send size={14} />
                </a>
              )}
            </div>
            {token.description && (
              <p className="text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
                {token.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Chart & Tabs */}
        <div className="lg:col-span-2 space-y-4">
          {/* Chart Container */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden h-[450px] flex flex-col">
            <div className="p-3 border-b border-[var(--border-color)] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{token.symbol}/ADA</span>
                <span className="text-xs text-green-500">+0.00%</span>
              </div>
              <div className="flex gap-2 text-xs text-[var(--muted)]">
                <span className="cursor-pointer hover:text-[var(--foreground)]">1m</span>
                <span className="cursor-pointer hover:text-[var(--foreground)]">5m</span>
                <span className="cursor-pointer hover:text-[var(--foreground)] text-[var(--foreground)] font-bold">15m</span>
                <span className="cursor-pointer hover:text-[var(--foreground)]">1h</span>
                <span className="cursor-pointer hover:text-[var(--foreground)]">4h</span>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center text-[var(--muted)] bg-black/20">
              <div className="text-center">
                <p className="mb-2">Chart Placeholder</p>
                <p className="text-xs opacity-50">TradingView integration coming soon</p>
              </div>
            </div>
          </div>

          {/* Tabs & Content */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden min-h-[300px]">
            <div className="flex border-b border-[var(--border-color)]">
              <button
                onClick={() => setActiveTab("thread")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "thread" ? "bg-[var(--input-bg)] text-[var(--foreground)] border-b-2 border-blue-500" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
              >
                Thread
              </button>
              <button
                onClick={() => setActiveTab("trades")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "trades" ? "bg-[var(--input-bg)] text-[var(--foreground)] border-b-2 border-blue-500" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
              >
                Trades
              </button>
            </div>
            <div className="p-4">
              {activeTab === "thread" ? (
                <div className="space-y-6">
                  {/* Comment Input */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center text-xs font-bold text-blue-500">
                      {walletAddress ? "You" : "?"}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
                        placeholder="Add a comment..."
                        className="w-full bg-[var(--input-bg)] rounded-lg px-3 py-2 text-sm outline-none border border-transparent focus:border-blue-500/50 transition-colors"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={handlePostComment}
                          disabled={isPosting || !commentText.trim()}
                          className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                          {isPosting ? "Posting..." : "Post"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <div className="text-center py-8 text-[var(--muted)] text-sm">
                        No comments yet. Be the first!
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-xs font-bold overflow-hidden">
                            {/* Placeholder avatar based on address */}
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500"></div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-0.5">
                              <span className="text-xs font-bold text-[var(--foreground)] bg-black/20 px-1.5 py-0.5 rounded">
                                {comment.sender.slice(0, 6)}
                              </span>
                              <span className="text-[10px] text-[var(--muted)]">
                                {formatTimeAgo(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 text-xs text-[var(--muted)] font-medium mb-2 px-2">
                    <span>Account</span>
                    <span className="text-right">Type</span>
                    <span className="text-right">ADA</span>
                    <span className="text-right">Date</span>
                  </div>
                  {/* Trades List (Placeholder) */}
                  <div className="text-center py-8 text-[var(--muted)] text-sm">
                    No trades yet.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Trade & Info */}
        <div className="space-y-4">
          {/* Trade Panel */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4">
            <div className="flex bg-[var(--input-bg)] rounded-lg p-1 mb-4">
              <button className="flex-1 py-2 rounded-md bg-green-500 text-black font-bold text-sm shadow-sm transition-all">Buy</button>
              <button className="flex-1 py-2 rounded-md text-[var(--muted)] font-medium text-sm hover:text-[var(--foreground)] transition-colors">Sell</button>
            </div>

            <div className="space-y-4">
              <div className="bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl p-3">
                <div className="flex justify-between text-xs text-[var(--muted)] mb-1">
                  <span className="font-medium">Amount (ADA)</span>
                  <span>Max: 0</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-transparent text-lg font-bold outline-none text-[var(--foreground)] placeholder:text-[var(--muted)]/50"
                  />
                  <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded text-xs font-medium">
                    <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px]">₳</span>
                    ADA
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {["10", "50", "100"].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setBuyAmount(amount)}
                    className="flex-1 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg py-1.5 text-xs font-medium hover:bg-[var(--border-color)] transition-colors"
                  >
                    {amount} ADA
                  </button>
                ))}
              </div>

              <button
                onClick={handleBuy}
                disabled={isBuying || !buyAmount}
                className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]"
              >
                {isBuying ? "Processing..." : "Quick Buy"}
              </button>
            </div>
          </div>

          {/* Bonding Curve */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4">
            <h3 className="font-bold text-sm mb-3">Bonding Curve Progress</h3>
            <div className="relative h-4 bg-[var(--input-bg)] rounded-full overflow-hidden mb-2">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-[var(--muted)]">
              <span>{progress.toFixed(2)}%</span>
              <span>Target: 5 ADA</span>
            </div>
            <p className="text-xs text-[var(--muted)] mt-3 leading-relaxed">
              When the market cap reaches 5 ADA, all liquidity is deposited into Minswap and burned.
            </p>
          </div>

          {/* Token Info */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--muted)]">Market Cap</span>
              <span className="font-bold text-sm">{token.marketCap || "$0"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--muted)]">Virtual Liquidity</span>
              <span className="font-bold text-sm">$0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--muted)]">24h Volume</span>
              <span className="font-bold text-sm">{token.volume || "$0"}</span>
            </div>
          </div>

          {/* Creator Actions */}
          {token.raisedAda >= 5 && token.creatorAddress === walletAddress && (
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4">
              <h3 className="font-bold text-sm mb-3">Creator Actions</h3>
              <button
                onClick={handleLaunchLP}
                disabled={isLaunching}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm"
              >
                {isLaunching ? "Launching..." : "Launch Liquidity Pool"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
