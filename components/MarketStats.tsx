"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import Link from "next/link";

interface Coin {
  id: string;
  name: string;
  symbol: string;
  image?: string;
  bondingCurve?: number;
  holders?: number;
  createdAt?: any;
}

const StatCard = ({ title, coin }: { title: string; coin: Coin | null }) => {
  if (!coin) {
    return (
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 flex-1">
        <div className="flex justify-between items-center mb-4 text-xs text-[var(--muted)] font-medium">
          <span>{title}</span>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-[var(--muted)]">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const bondingCurve = coin.bondingCurve || Math.floor(Math.random() * 100);
  const holders = coin.holders || Math.floor(Math.random() * 500) + 10;

  return (
    <Link href={`/token/${coin.id}`} className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 flex-1 hover:border-blue-500/50 transition-colors cursor-pointer block">
      <div className="flex justify-between items-center mb-4 text-xs text-[var(--muted)] font-medium">
        <span>{title}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Left side - Coin info */}
        <div className="flex items-center gap-4 flex-1">
          <img
            src={coin.image || "/placeholder.png"}
            alt={coin.name}
            className="w-12 h-12 rounded-full object-cover border border-[var(--border-color)]"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerText = coin.symbol[0];
              e.currentTarget.parentElement!.className = "w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-bold text-[var(--foreground)] border border-[var(--border-color)]";
            }}
          />
          <div className="flex-1">
            <div className="font-bold text-[var(--foreground)]">
              {coin.name}
            </div>
            <div className="text-sm text-[var(--muted)]">{coin.symbol}</div>
          </div>
        </div>

        {/* Right side - Bonding curve and holders */}
        <div className="flex flex-col gap-2 min-w-[120px]">
          {/* Bonding Curve */}
          <div>
            <div className="flex justify-between text-xs text-[var(--muted)] mb-1">
              <span>Bonding</span>
              <span
                className={
                  bondingCurve > 80 ? "text-amber-400" : "text-emerald-400"
                }
              >
                {bondingCurve}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-[var(--input-bg)] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${bondingCurve > 80
                  ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                  : "bg-emerald-400"
                  }`}
                style={{ width: `${bondingCurve}%` }}
              />
            </div>
          </div>

          {/* Holders */}
          <div className="flex justify-between text-xs">
            <span className="text-[var(--muted)]">Holders</span>
            <span className="font-medium text-[var(--foreground)]">
              {holders}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function MarketStats() {
  const [newCoin, setNewCoin] = useState<Coin | null>(null);
  const [topMoverCoin, setTopMoverCoin] = useState<Coin | null>(null);
  const [popularCoin, setPopularCoin] = useState<Coin | null>(null);
  const [allCoins, setAllCoins] = useState<Coin[]>([]);
  const [usedCoinIds, setUsedCoinIds] = useState<Set<string>>(new Set());

  // Fetch all coins from Firebase
  const fetchCoins = async () => {
    try {
      const coinsRef = collection(db, "memecoins");
      const q = query(coinsRef, orderBy("createdAt", "desc"), limit(50));
      const querySnapshot = await getDocs(q);

      const coins: Coin[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Coin, "id">),
      }));

      setAllCoins(coins);

      // Set initial coins
      if (coins.length > 0) {
        const initialUsed = new Set<string>();

        // New coin (most recent)
        if (coins[0]) {
          setNewCoin(coins[0]);
          initialUsed.add(coins[0].id);
        }

        // Top mover (second coin)
        if (coins[1]) {
          setTopMoverCoin(coins[1]);
          initialUsed.add(coins[1].id);
        }

        // Popular (third coin)
        if (coins[2]) {
          setPopularCoin(coins[2]);
          initialUsed.add(coins[2].id);
        }

        setUsedCoinIds(initialUsed);
      }
    } catch (error) {
      console.error("Error fetching coins:", error);
    }
  };

  // Get a random unique coin
  const getRandomUniqueCoin = (excludeIds: Set<string>): Coin | null => {
    const availableCoins = allCoins.filter((coin) => !excludeIds.has(coin.id));
    if (availableCoins.length === 0) {
      // If all coins are used, reset and start over
      setUsedCoinIds(new Set());
      return allCoins.length > 0
        ? allCoins[Math.floor(Math.random() * allCoins.length)]
        : null;
    }
    return availableCoins[Math.floor(Math.random() * availableCoins.length)];
  };

  // Fetch coins on mount
  useEffect(() => {
    fetchCoins();
  }, []);

  // Rotate "New" category every 10 seconds
  useEffect(() => {
    if (allCoins.length < 3) return;

    const interval = setInterval(() => {
      const newUsedIds = new Set(usedCoinIds);
      const oldCoinId = newCoin?.id || null;
      const newCoinToSet = getRandomUniqueCoin(newUsedIds);

      if (newCoinToSet) {
        setNewCoin(newCoinToSet);
        if (oldCoinId) newUsedIds.delete(oldCoinId);
        newUsedIds.add(newCoinToSet.id);
        setUsedCoinIds(newUsedIds);
      }
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [allCoins, usedCoinIds, newCoin]);

  // Rotate "Top Movers" category every 7 seconds
  useEffect(() => {
    if (allCoins.length < 3) return;

    const interval = setInterval(() => {
      const newUsedIds = new Set(usedCoinIds);
      const oldCoinId = topMoverCoin?.id || null;
      const newCoinToSet = getRandomUniqueCoin(newUsedIds);

      if (newCoinToSet) {
        setTopMoverCoin(newCoinToSet);
        if (oldCoinId) newUsedIds.delete(oldCoinId);
        newUsedIds.add(newCoinToSet.id);
        setUsedCoinIds(newUsedIds);
      }
    }, 4000); // 7 seconds

    return () => clearInterval(interval);
  }, [allCoins, usedCoinIds, topMoverCoin]);

  // Rotate "Popular" category every 5 seconds
  useEffect(() => {
    if (allCoins.length < 3) return;

    const interval = setInterval(() => {
      const newUsedIds = new Set(usedCoinIds);
      const oldCoinId = popularCoin?.id || null;
      const newCoinToSet = getRandomUniqueCoin(newUsedIds);

      if (newCoinToSet) {
        setPopularCoin(newCoinToSet);
        if (oldCoinId) newUsedIds.delete(oldCoinId);
        newUsedIds.add(newCoinToSet.id);
        setUsedCoinIds(newUsedIds);
      }
    }, 3000); // 5 seconds

    return () => clearInterval(interval);
  }, [allCoins, usedCoinIds, popularCoin]);

  return (
    <div className="w-full max-w-[1400px] mx-auto mt-6 px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="New" coin={newCoin} />
        <StatCard title="Top Movers" coin={topMoverCoin} />
        <StatCard title="Popular" coin={popularCoin} />
      </div>
    </div>
  );
}
