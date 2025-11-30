"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, onSnapshot, collection, addDoc, query, orderBy, serverTimestamp, Timestamp, limit, updateDoc, increment, setDoc } from "firebase/firestore";
import { useWallet } from "../context/WalletContext";
import { Loader2, ExternalLink, Globe, Twitter, Send, Copy, RefreshCw, BarChart2, LineChart } from "lucide-react";
import Image from "next/image";
import { buyToken, sellToken, launchLP, calculateAmountOut, calculateRefund } from "../lib/transactions";
import PriceChart from "./PriceChart";
import CandleChart from "./CandleChart";
import { toast } from "sonner";

interface Comment {
  id: string;
  text: string;
  sender: string;
  createdAt: any;
}

interface Trade {
  id: string;
  type: 'buy' | 'sell';
  amountAda: number;
  amountToken: number;
  account: string;
  timestamp: any;
  txnHash: string;
}

export default function TokenDetails({ tokenId }: { tokenId: string }) {
  const [token, setToken] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [isBuying, setIsBuying] = useState(false);
  const [isSelling, setIsSelling] = useState(false);
  const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy");
  const [isLaunching, setIsLaunching] = useState(false);
  const [activeTab, setActiveTab] = useState<"thread" | "trades">("trades");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [estTokens, setEstTokens] = useState<string>("0");
  const [holders, setHolders] = useState<any[]>([]);
  const { isConnected, walletAddress, walletName } = useWallet();
  const [chartType, setChartType] = useState<"candle" | "line">("candle");
  const [timeframe, setTimeframe] = useState<"1m" | "5m" | "15m" | "1h" | "4h">("15m");

  // Fetch User Balances
  useEffect(() => {
    if (!isConnected || !walletAddress || !tokenId) return;
    
    // Fetch Token Balance
    const unsubToken = onSnapshot(doc(db, "memecoins", tokenId, "holders", walletAddress), (doc) => {
      if (doc.exists()) {
        setUserBalance(doc.data().balance || 0);
      } else {
        setUserBalance(0);
      }
    });

    return () => unsubToken();
  }, [tokenId, walletAddress, isConnected]);

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

  // Fetch Trades & Holders
  useEffect(() => {
    // Fetch Trades
    const tradesRef = collection(db, "memecoins", tokenId, "trades");
    const qTrades = query(tradesRef, orderBy("timestamp", "desc"), limit(500)); // Increased limit for charts
    const unsubscribeTrades = onSnapshot(qTrades, (snapshot) => {
      const tradesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrades(tradesData as Trade[]);
    });

    // Fetch Holders
    const holdersRef = collection(db, "memecoins", tokenId, "holders");
    const qHolders = query(holdersRef, orderBy("balance", "desc"), limit(10));
    const unsubscribeHolders = onSnapshot(qHolders, (snapshot) => {
        const holdersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHolders(holdersData);
    });

    return () => {
      unsubscribeTrades();
      unsubscribeHolders();
    };
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
    if (!isConnected || !walletAddress) {
      toast.error("Please connect wallet");
      return;
    }

    // Check Funding Goal
    if ((token.raisedAda || 0) >= 100) {
        toast.error("Bonding curve completed! No more transactions possible.");
        return;
    }

    setIsBuying(true);
    try {
      const cardano = (window as any).cardano;
      if (!walletName) throw new Error("Wallet not connected properly");
      const walletApi = await cardano[walletName].enable();

      // Calculate amounts
      const currentSupply = BigInt(token.currentSupply || 0);
      const amountAdaInput = parseFloat(buyAmount);
      const amountAdaBig = BigInt(Math.floor(amountAdaInput * 1_000_000));
      
      const amountOut = calculateAmountOut(currentSupply, amountAdaBig);
      const amountOutNumber = Number(amountOut);

      // Fetch Admin Wallet Address
      const statsRef = doc(db, "platform_stats", "global");
      const statsSnap = await getDoc(statsRef);
      const adminAddress = statsSnap.exists() ? statsSnap.data().adminWalletAddress : undefined;

      // Execute Transaction (Fee only)
      const txHash = await buyToken(walletApi, token.token_policy_id || "", amountOut, currentSupply, adminAddress);
      console.log("Buy Tx:", txHash);

      // Update Token State in Firestore
      const newRaisedAda = (token.raisedAda || 0) + amountAdaInput;
      const newCurrentSupply = (token.currentSupply || 0) + amountOutNumber;
      const bondingCurveProgress = Math.min((newRaisedAda / 100) * 100, 100);
      
      // Calculate Price and Market Cap
      // Price = ADA / Token (for this trade) or derived from curve
      // Simple approximation: Price = amountAdaInput / amountOutNumber
      const tradePrice = amountAdaInput / amountOutNumber;
      const newMarketCap = newCurrentSupply * tradePrice;

      await updateDoc(doc(db, "memecoins", tokenId), {
        raisedAda: increment(amountAdaInput),
        currentSupply: increment(amountOutNumber),
        volume: increment(amountAdaInput),
        marketCap: newMarketCap, // Updated Market Cap logic
        bondingCurve: bondingCurveProgress,
        holderCount: increment(0) // Will update below if new holder
      });

      // Update Platform Stats
      await updateDoc(statsRef, {
          totalEarnings: increment(amountAdaInput), 
          totalTransactions: increment(1)
      });

      // Update Holder Balance
      const holderRef = doc(db, "memecoins", tokenId, "holders", walletAddress);
      const holderSnap = await getDoc(holderRef);
      
      if (holderSnap.exists()) {
        await updateDoc(holderRef, { balance: increment(amountOutNumber) });
      } else {
        // New Holder
        await setDoc(holderRef, { balance: amountOutNumber, address: walletAddress });
        // Increment global holder count for the token
        await updateDoc(doc(db, "memecoins", tokenId), {
            holderCount: increment(1)
        });
      }

      // Update User's Held Coins (Global)
      const userHeldCoinRef = doc(db, "users", walletAddress, "heldCoins", tokenId);
      const userHeldCoinSnap = await getDoc(userHeldCoinRef);
      if (userHeldCoinSnap.exists()) {
         await updateDoc(userHeldCoinRef, { balance: increment(amountOutNumber) });
      } else {
         await setDoc(userHeldCoinRef, { 
             balance: amountOutNumber, 
             symbol: token.symbol, 
             name: token.name, 
             image: token.image || "",
             tokenId: tokenId
         });
      }

      // Record Trade
      await addDoc(collection(db, "memecoins", tokenId, "trades"), {
        type: "buy",
        amountAda: amountAdaInput,
        amountToken: amountOutNumber,
        account: walletAddress,
        timestamp: serverTimestamp(),
        txnHash: txHash,
      });

      toast.success(`Bought ${amountOutNumber} tokens!`);
      setBuyAmount("");
    } catch (error) {
      console.error("Buy failed:", error);
      toast.error("Buy failed. See console.");
    } finally {
      setIsBuying(false);
    }
  };

  const handleSell = async () => {
    if (!isConnected || !walletAddress) {
      toast.error("Please connect wallet");
      return;
    }

    // Check Funding Goal
    if ((token.raisedAda || 0) >= 100) {
        toast.error("Bonding curve completed! No more transactions possible.");
        return;
    }

    setIsSelling(true);
    try {
      const cardano = (window as any).cardano;
      if (!walletName) throw new Error("Wallet not connected properly");
      const walletApi = await cardano[walletName].enable();

      // Calculate amounts
      const currentSupply = BigInt(token.currentSupply || 0);
      const amountToSell = parseFloat(sellAmount);
      const amountToSellBig = BigInt(Math.floor(amountToSell));
      
      const refundLovelace = calculateRefund(currentSupply, amountToSellBig);
      const refundAda = Number(refundLovelace) / 1_000_000;

      // Execute Transaction (Dummy)
      const txHash = await sellToken(walletApi, token.token_policy_id || "", amountToSellBig);
      console.log("Sell Tx:", txHash);

      // Update Token State
      const newRaisedAda = (token.raisedAda || 0) - refundAda;
      const newCurrentSupply = (token.currentSupply || 0) - amountToSell;
      const bondingCurveProgress = Math.min((newRaisedAda / 100) * 100, 100);
      
      // Calculate Price and Market Cap
      const tradePrice = refundAda / amountToSell;
      const newMarketCap = newCurrentSupply * tradePrice;

      await updateDoc(doc(db, "memecoins", tokenId), {
        raisedAda: increment(-refundAda),
        currentSupply: increment(-amountToSell),
        volume: increment(refundAda), // Volume always increases
        marketCap: newMarketCap,
        bondingCurve: bondingCurveProgress
      });

      // Update Holder Balance
      const holderRef = doc(db, "memecoins", tokenId, "holders", walletAddress);
      const holderSnap = await getDoc(holderRef);
      
      if (holderSnap.exists()) {
          const currentBalance = holderSnap.data().balance || 0;
          const newBalance = currentBalance - amountToSell;
          
          if (newBalance <= 0) {
              // Remove holder if balance is 0 (optional, or just set to 0)
              // Keeping it at 0 is safer for history, but if we want to track active holders:
              if (newBalance === 0) {
                   await updateDoc(doc(db, "memecoins", tokenId), {
                        holderCount: increment(-1)
                   });
              }
          }
          await updateDoc(holderRef, { balance: increment(-amountToSell) });
      }

      // Update User's Held Coins (Global)
      const userHeldCoinRef = doc(db, "users", walletAddress, "heldCoins", tokenId);
      await updateDoc(userHeldCoinRef, { balance: increment(-amountToSell) });

      // Record Trade
      await addDoc(collection(db, "memecoins", tokenId, "trades"), {
        type: "sell",
        amountAda: refundAda,
        amountToken: amountToSell,
        account: walletAddress,
        timestamp: serverTimestamp(),
        txnHash: txHash,
      });

      toast.success(`Sold ${amountToSell} tokens for ${refundAda.toFixed(2)} ADA!`);
      setSellAmount("");
    } catch (error) {
      console.error("Sell failed:", error);
      toast.error("Sell failed. See console.");
    } finally {
      setIsSelling(false);
    }
  };

  const handleLaunchLP = async () => {
    if (!isConnected) return;
    setIsLaunching(true);
    try {
      const cardano = (window as any).cardano;
      if (!walletName) throw new Error("Wallet not connected properly");
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

  // Prepare Chart Data - MUST be before conditional returns (React Rules of Hooks)
  const lineChartData = useMemo(() => {
     return trades
        .filter(t => t.amountAda > 0 && t.amountToken > 0)
        .sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0))
        .map(t => ({
          timestamp: (t.timestamp?.seconds || 0) * 1000,
          price: t.amountAda / t.amountToken
        }));
  }, [trades]);

  // Prepare Candle Data - MUST be before conditional returns (React Rules of Hooks)
  const candleChartData = useMemo(() => {
      if (!trades.length) return [];
      
      const sortedTrades = [...trades]
        .filter(t => t.amountAda > 0 && t.amountToken > 0)
        .sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));

      if (sortedTrades.length === 0) return [];

      const candles: any[] = [];
      // 15m candles by default for now, can make dynamic
      const interval = timeframe === "1m" ? 60 : timeframe === "5m" ? 300 : timeframe === "15m" ? 900 : timeframe === "1h" ? 3600 : 14400; 
      
      let currentCandle: any = null;

      sortedTrades.forEach(trade => {
          const timestamp = trade.timestamp?.seconds || 0;
          const price = trade.amountAda / trade.amountToken;
          const candleTime = Math.floor(timestamp / interval) * interval;

          if (!currentCandle) {
              currentCandle = {
                  time: candleTime,
                  open: price,
                  high: price,
                  low: price,
                  close: price
              };
          } else if (candleTime === currentCandle.time) {
              currentCandle.high = Math.max(currentCandle.high, price);
              currentCandle.low = Math.min(currentCandle.low, price);
              currentCandle.close = price;
          } else {
              candles.push(currentCandle);
              currentCandle = {
                  time: candleTime,
                  open: candles[candles.length - 1].close, // Open at previous close
                  high: price,
                  low: price,
                  close: price
              };
          }
      });
      if (currentCandle) candles.push(currentCandle);
      
      // Fill gaps if needed, but for now just return candles
      return candles;
  }, [trades, timeframe]);

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

  const progress = Math.min(((token.raisedAda || 0) / 100) * 100, 100);
  const holderPercentage = userBalance && token.currentSupply ? ((userBalance / token.currentSupply) * 100).toFixed(2) : "0.00";

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
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden h-[500px] flex flex-col">
            <div className="p-3 border-b border-[var(--border-color)] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{token.symbol}/ADA</span>
                <span className="text-xs text-green-500">+0.00%</span>
              </div>
              <div className="flex items-center gap-4">
                  <div className="flex bg-[var(--input-bg)] rounded-lg p-0.5">
                      <button 
                        onClick={() => setChartType("candle")}
                        className={`p-1.5 rounded-md transition-colors ${chartType === "candle" ? "bg-[var(--card-bg)] text-[var(--foreground)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
                      >
                          <BarChart2 size={16} />
                      </button>
                      <button 
                        onClick={() => setChartType("line")}
                        className={`p-1.5 rounded-md transition-colors ${chartType === "line" ? "bg-[var(--card-bg)] text-[var(--foreground)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
                      >
                          <LineChart size={16} />
                      </button>
                  </div>
                  <div className="flex gap-2 text-xs text-[var(--muted)]">
                    {["1m", "5m", "15m", "1h", "4h"].map((t) => (
                        <span 
                            key={t}
                            onClick={() => setTimeframe(t as any)}
                            className={`cursor-pointer hover:text-[var(--foreground)] ${timeframe === t ? "text-[var(--foreground)] font-bold" : ""}`}
                        >
                            {t}
                        </span>
                    ))}
                  </div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center text-[var(--muted)] bg-black/20 relative w-full overflow-hidden">
               {chartType === "candle" ? (
                   <CandleChart data={candleChartData} />
               ) : (
                   <PriceChart data={lineChartData} />
               )}
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
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs text-[var(--muted)] border-b border-[var(--border-color)]">
                        <th className="font-medium py-2 pl-2">Account</th>
                        <th className="font-medium py-2">Type</th>
                        <th className="font-medium py-2">Amount (ADA)</th>
                        <th className="font-medium py-2">Amount ({token.symbol})</th>
                        <th className="font-medium py-2">Time</th>
                        <th className="font-medium py-2 pr-2">Txn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-[var(--muted)] text-sm">
                            No trades yet.
                          </td>
                        </tr>
                      ) : (
                        trades.map((trade) => (
                          <tr key={trade.id} className="border-b border-[var(--border-color)] last:border-none hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-xs">
                            <td className="py-2 pl-2 flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-blue-500"></div>
                              <span className="font-medium text-[var(--foreground)]">{trade.account.slice(0, 6)}</span>
                            </td>
                            <td className={`py-2 font-bold ${trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                              {trade.type === 'buy' ? 'Buy' : 'Sell'}
                            </td>
                            <td className="py-2 text-[var(--foreground)]">{trade.amountAda}</td>
                            <td className="py-2 text-[var(--foreground)]">{trade.amountToken || "-"}</td>
                            <td className="py-2 text-[var(--muted)]">{formatTimeAgo(trade.timestamp)}</td>
                            <td className="py-2 pr-2">
                              <a href={`https://preprod.cardanoscan.io/transaction/${trade.txnHash}`} target="_blank" className="text-blue-500 hover:underline truncate max-w-[60px] block">
                                {trade.txnHash.slice(0, 6)}
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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
              <button
                onClick={() => setTradeMode("buy")}
                className={`flex-1 py-2 rounded-md font-bold text-sm shadow-sm transition-all ${tradeMode === "buy" ? "bg-green-500 text-black" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
              >
                Buy
              </button>
              <button
                onClick={() => setTradeMode("sell")}
                className={`flex-1 py-2 rounded-md font-bold text-sm shadow-sm transition-all ${tradeMode === "sell" ? "bg-red-500 text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
              >
                Sell
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl p-3">
                <div className="flex justify-between text-xs text-[var(--muted)] mb-1">
                  <span className="font-medium">Amount ({tradeMode === "buy" ? "ADA" : token.symbol})</span>
                  <div className="flex gap-2">
                    <span>Max: {tradeMode === "buy" ? "∞" : userBalance}</span>
                    {tradeMode === "sell" && <span className="text-[var(--muted)]">({holderPercentage}%)</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={tradeMode === "buy" ? buyAmount : sellAmount}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (tradeMode === "buy") {
                            setBuyAmount(val);
                            // Estimate tokens
                            if (val && !isNaN(parseFloat(val)) && token) {
                                const currentSupply = BigInt(token.currentSupply || 0);
                                const amountAdaBig = BigInt(Math.floor(parseFloat(val) * 1_000_000));
                                const est = calculateAmountOut(currentSupply, amountAdaBig);
                                setEstTokens(est.toString());
                            } else {
                                setEstTokens("0");
                            }
                        } else {
                            setSellAmount(val);
                        }
                    }}
                    placeholder="0.0"
                    className="w-full bg-transparent text-lg font-bold outline-none text-[var(--foreground)] placeholder:text-[var(--muted)]/50"
                  />
                  <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded text-xs font-medium">
                    {tradeMode === "buy" ? (
                      <>
                        <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px]">₳</span>
                        ADA
                      </>
                    ) : (
                      <>
                        <span className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-[8px]">{token.symbol?.[0]}</span>
                        {token.symbol}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {tradeMode === "buy" && buyAmount && (
                  <div className="text-xs text-[var(--muted)] text-right">
                      Est. received: <span className="font-bold text-[var(--foreground)]">{estTokens}</span> {token.symbol}
                  </div>
              )}

              {tradeMode === "buy" && (
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
              )}

              <button
                onClick={tradeMode === "buy" ? handleBuy : handleSell}
                disabled={
                    (token.raisedAda || 0) >= 100 || 
                    (tradeMode === "buy" ? (isBuying || !buyAmount) : (isSelling || !sellAmount))
                }
                className={`w-full font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                  tradeMode === "buy"
                    ? "bg-green-500 hover:bg-green-400 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                    : "bg-red-500 hover:bg-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                }`}
              >
                {(token.raisedAda || 0) >= 100 
                    ? "Bonding Curve Completed" 
                    : (tradeMode === "buy"
                        ? (isBuying ? "Processing..." : "Quick Buy")
                        : (isSelling ? "Processing..." : "Quick Sell")
                      )
                }
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
              <span>Target: 100 ADA</span>
            </div>
            <p className="text-xs text-[var(--muted)] mt-3 leading-relaxed">
              When the market cap reaches 100 ADA, all liquidity is deposited into Minswap and burned.
            </p>
          </div>

          {/* Token Info */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--muted)]">Remaining Tokens</span>
              <span className="font-bold text-sm">{(1000000 - (token.currentSupply || 0)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--muted)]">Market Cap</span>
              <span className="font-bold text-sm">{token.marketCap ? `${token.marketCap.toFixed(2)} ADA` : "$0"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--muted)]">Virtual Liquidity</span>
              <span className="font-bold text-sm">$0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--muted)]">24h Volume</span>
              <span className="font-bold text-sm">{token.volume ? `${token.volume.toFixed(2)} ADA` : "$0"}</span>
            </div>
          </div>

          {/* Holder Distribution */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4">
            <h3 className="font-bold text-sm mb-3">Holder Distribution</h3>
            <div className="space-y-2">
                {holders.map((holder, index) => {
                    const percentage = token.currentSupply ? ((holder.balance / token.currentSupply) * 100).toFixed(2) : "0.00";
                    return (
                        <div key={holder.id} className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                                <span className="text-[var(--muted)]">{index + 1}.</span>
                                <span className="font-medium truncate max-w-[100px]">
                                    {holder.address === walletAddress ? "You" : `${holder.address.slice(0, 4)}...${holder.address.slice(-4)}`}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[var(--muted)]">{holder.balance.toLocaleString()}</span>
                                <span className="font-bold text-[var(--foreground)]">{percentage}%</span>
                            </div>
                        </div>
                    );
                })}
                {holders.length === 0 && <div className="text-center text-[var(--muted)] text-xs">No holders yet</div>}
            </div>
          </div>

          {/* Creator Actions */}
          {token.raisedAda >= 100 && token.creatorAddress === walletAddress && (
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
