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
  holderCount?: number;
  createdAt?: any;
}

const StatCard = ({
  title,
  coin,
  isLoading,
  error,
}: {
  title: string;
  coin: Coin | null;
  isLoading: boolean;
  error: string | null;
}) => {
  if (isLoading) {
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

  if (error) {
    return (
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 flex-1">
        <div className="flex justify-between items-center mb-4 text-xs text-[var(--muted)] font-medium">
          <span>{title}</span>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-red-500 text-sm text-center">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 flex-1">
        <div className="flex justify-between items-center mb-4 text-xs text-[var(--muted)] font-medium">
          <span>{title}</span>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-[var(--muted)]">
          <p>No Data</p>
        </div>
      </div>
    );
  }

  const bondingCurve = coin.bondingCurve || 0;
  // Use holderCount if available, otherwise fallback to 0 (no random data)
  const holders = coin.holderCount || 0;

  return (
    <Link
      href={`/token/${coin.id}`}
      className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 flex-1 hover:border-blue-500/50 transition-colors cursor-pointer block"
    >
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
              const target = e.currentTarget;
              target.style.display = "none";
              if (target.parentElement) {
                target.parentElement.innerText = coin.symbol
                  ? coin.symbol[0]
                  : "?";
                target.parentElement.className =
                  "w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-bold text-[var(--foreground)] border border-[var(--border-color)]";
              }
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
                {bondingCurve.toFixed(2)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-[var(--input-bg)] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  bondingCurve > 80
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to initialize the 3 main cards from a list of coins
  const initializeStats = (coins: Coin[]) => {
    if (coins.length > 0) {
      const initialUsed = new Set<string>();
      // Filter coins to only include those with valid images for the stats cards
      const coinsWithImages = coins.filter(
        (c) =>
          c.image &&
          c.image !== "/placeholder.png" &&
          !c.image.includes("placeholder"),
      );

      let newC: Coin | null = null;
      let topC: Coin | null = null;
      let popC: Coin | null = null;

      if (coinsWithImages.length > 0) {
        // New coin (most recent with image)
        if (coinsWithImages[0]) {
          newC = coinsWithImages[0];
          initialUsed.add(coinsWithImages[0].id);
        }

        // Top mover (second coin with image)
        if (coinsWithImages[1]) {
          topC = coinsWithImages[1];
          initialUsed.add(coinsWithImages[1].id);
        }

        // Popular (third coin with image)
        if (coinsWithImages[2]) {
          popC = coinsWithImages[2];
          initialUsed.add(coinsWithImages[2].id);
        }
      } else {
        // Fallback to any coins if no images found? User said "do not display the coins without the images",
        // so we leave them null (which shows "No Data")
        console.warn("MarketStats: No coins with images found");
      }

      setNewCoin(newC);
      setTopMoverCoin(topC);
      setPopularCoin(popC);
      setUsedCoinIds(initialUsed);
    }
  };

  // Fetch all coins from Firebase
  const fetchCoins = async () => {
    try {
      // Don't set isLoading(true) here if we already have data from cache
      // only set it if we have nothing.
      if (allCoins.length === 0) {
        setIsLoading(true);
      }
      setError(null);
      const coinsRef = collection(db, "memecoins");
      const q = query(coinsRef, orderBy("createdAt", "desc"), limit(50));
      const querySnapshot = await getDocs(q);

      const coins: Coin[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Coin, "id">),
      }));

      console.log(`MarketStats: Fetched ${coins.length} coins`);
      setAllCoins(coins);
      initializeStats(coins);

      // Save to cache
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "marketStatsData",
          JSON.stringify({
            timestamp: Date.now(),
            data: coins,
          }),
        );
      }

      if (coins.length === 0) {
        console.warn("MarketStats: No coins found in database");
      }
    } catch (error) {
      console.error("Error fetching coins:", error);
      // Only show error in UI if we don't have cached data shown
      if (allCoins.length === 0) {
        setError("Error loading data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get a random unique coin with image
  const getRandomUniqueCoinWithImage = (
    excludeIds: Set<string>,
  ): Coin | null => {
    // Filter allCoins to only those with images
    const candidates = allCoins.filter(
      (c) =>
        c.image &&
        c.image !== "/placeholder.png" &&
        !c.image.includes("placeholder"),
    );

    const availableCoins = candidates.filter(
      (coin) => !excludeIds.has(coin.id),
    );

    if (availableCoins.length === 0) {
      // If all appropriate coins are used, reset and start over
      if (candidates.length > 0) {
        // Just pick a random one from candidates to keep the rotation going
        return candidates[Math.floor(Math.random() * candidates.length)];
      }
      return null;
    }
    return availableCoins[Math.floor(Math.random() * availableCoins.length)];
  };

  // Load from cache on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("marketStatsData");
        if (cached) {
          const parsed = JSON.parse(cached);
          // Optional: check timestamp here if needed (e.g. > 1 hour old)
          if (
            parsed.data &&
            Array.isArray(parsed.data) &&
            parsed.data.length > 0
          ) {
            console.log("MarketStats: Loading from cache");
            setAllCoins(parsed.data);
            initializeStats(parsed.data);
            setIsLoading(false);
          }
        }
      } catch (e) {
        console.error("Error loading cache:", e);
      }
    }

    fetchCoins();
  }, []);

  // Rotate "New" category every 10 seconds
  useEffect(() => {
    if (allCoins.length < 3) return;

    const interval = setInterval(() => {
      const newUsedIds = new Set(usedCoinIds);
      const oldCoinId = newCoin?.id || null;
      // Pass the current used IDs to avoid duplicates in this specific step
      const newCoinToSet = getRandomUniqueCoinWithImage(newUsedIds);

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
      const newCoinToSet = getRandomUniqueCoinWithImage(newUsedIds);

      if (newCoinToSet) {
        setTopMoverCoin(newCoinToSet);
        if (oldCoinId) newUsedIds.delete(oldCoinId);
        newUsedIds.add(newCoinToSet.id);
        setUsedCoinIds(newUsedIds);
      }
    }, 4000); // 7 seconds (was 4000 in original code comment said 7)

    return () => clearInterval(interval);
  }, [allCoins, usedCoinIds, topMoverCoin]);

  // Rotate "Popular" category every 5 seconds
  useEffect(() => {
    if (allCoins.length < 3) return;

    const interval = setInterval(() => {
      const newUsedIds = new Set(usedCoinIds);
      const oldCoinId = popularCoin?.id || null;
      const newCoinToSet = getRandomUniqueCoinWithImage(newUsedIds);

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
        <StatCard
          title="New"
          coin={newCoin}
          isLoading={isLoading}
          error={error}
        />
        <StatCard
          title="Top Movers"
          coin={topMoverCoin}
          isLoading={isLoading}
          error={error}
        />
        <StatCard
          title="Popular"
          coin={popularCoin}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
