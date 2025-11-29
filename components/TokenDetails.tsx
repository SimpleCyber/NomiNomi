"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useWallet } from "../context/WalletContext";
import { Loader2, ExternalLink } from "lucide-react";
import Image from "next/image";
import { buyToken, launchLP } from "../lib/transactions";
import { toast } from "sonner";

export default function TokenDetails({ tokenId }: { tokenId: string }) {
  const [token, setToken] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buyAmount, setBuyAmount] = useState("");
  const [isBuying, setIsBuying] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
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

  const handleBuy = async () => {
    if (!isConnected) {
      alert("Please connect wallet");
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

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (!token) return <div className="p-8">Token not found</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Chart & Info */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-[var(--input-bg)]">
              {token.image && <Image src={token.image} alt={token.name} fill className="object-cover" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{token.name} <span className="text-[var(--muted)] text-lg">({token.symbol})</span></h1>
              <p className="text-[var(--muted)] mt-1">{token.description}</p>
              <div className="flex gap-3 mt-3">
                {token.website && <a href={token.website} target="_blank" className="text-blue-400 hover:underline flex items-center gap-1 text-sm"><ExternalLink size={14} /> Website</a>}
                {token.twitter && <a href={token.twitter} target="_blank" className="text-blue-400 hover:underline flex items-center gap-1 text-sm"><ExternalLink size={14} /> Twitter</a>}
              </div>
            </div>
          </div>
          
          {/* Bonding Curve Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Bonding Curve Progress</span>
              <span>{((token.raisedAda || 0) / 5 * 100).toFixed(2)}%</span>
            </div>
            <div className="h-4 bg-[var(--input-bg)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${Math.min((token.raisedAda || 0) / 5 * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-[var(--muted)]">
              When the market cap reaches 5 ADA, all liquidity is deposited into Minswap and burned.
            </p>
          </div>

          {/* Launch LP Button (Creator Only) */}
          {token.raisedAda >= 5 && token.creatorAddress === walletAddress && (
            <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
              <h3 className="font-bold mb-2">Creator Actions</h3>
              <button
                onClick={handleLaunchLP}
                disabled={isLaunching}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isLaunching ? "Launching LP..." : "Launch Liquidity Pool"}
              </button>
            </div>
          )}
        </div>
        
        {/* Chart Placeholder */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 h-96 flex items-center justify-center text-[var(--muted)]">
          Chart will be here
        </div>
      </div>

      {/* Right: Buy/Sell */}
      <div className="space-y-6">
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Buy {token.symbol}</h2>
          
          <div className="space-y-4">
            <div className="bg-[var(--input-bg)] rounded-lg p-4 border border-[var(--border-color)]">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-[var(--muted)]">You pay</span>
                <span className="text-sm text-[var(--muted)]">Balance: 0 ADA</span>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  placeholder="0.0"
                  className="bg-transparent text-2xl font-bold outline-none w-full"
                />
                <span className="font-bold">ADA</span>
              </div>
            </div>

            <button 
              onClick={handleBuy}
              disabled={isBuying || !buyAmount}
              className="w-full bg-green-500 text-black font-bold py-3 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50"
            >
              {isBuying ? "Buying..." : "Quick Buy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
