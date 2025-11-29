"use client";

import { LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import { Sparkline } from "@/components/ui/Sparkline";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useEffect } from "react";
import { Market, MARKETS } from "@/data/constants";

export default function MarketTicker() {
  const [activeTab, setActiveTab] = useState("Spot");
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch coins from Firestore
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const q = query(
          collection(db, "memecoins"),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        const querySnapshot = await getDocs(q);
        
        const fetchedMarkets: Market[] = querySnapshot.docs.map((doc, index) => {
          const data = doc.data();
          // Generate dummy data for missing fields
          const isPositive = Math.random() > 0.5;
          const changeValue = (Math.random() * 20).toFixed(2);
          
          return {
            id: doc.id,
            name: data.name || "Unknown",
            symbol: data.symbol || "UNK",
            price: `$${(Math.random() * 1000).toFixed(2)}`, // Dummy price
            volume: `$${(Math.random() * 100000).toFixed(2)}`, // Dummy volume
            marketCap: `$${(Math.random() * 1000000).toFixed(2)}`, // Dummy mcap
            change: `${isPositive ? "+" : "-"}${changeValue}%`,
            change5m: `${Math.random() > 0.5 ? "+" : "-"}${(Math.random() * 5).toFixed(2)}%`,
            change1h: `${isPositive ? "+" : "-"}${changeValue}%`,
            change6h: `${Math.random() > 0.5 ? "+" : "-"}${(Math.random() * 10).toFixed(2)}%`,
            isPositive: isPositive,
            chartData: Array.from({ length: 10 }, () => Math.floor(Math.random() * 50) + 10),
            bondingCurve: Math.floor(Math.random() * 100),
            ath: `$${(Math.random() * 2000).toFixed(2)}`,
            age: "1h", // Dummy age
            txns: Math.floor(Math.random() * 1000),
            traders: Math.floor(Math.random() * 500),
            image: data.image || "/placeholder.png",
          };
        });

        // If no coins found, fallback to dummy MARKETS
        if (fetchedMarkets.length === 0) {
            setMarkets(MARKETS);
        } else {
            setMarkets(fetchedMarkets);
        }
      } catch (error) {
        console.error("Error fetching markets:", error);
        setMarkets(MARKETS); // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  // Shuffle markets when tab changes
  useEffect(() => {
    if (markets.length > 0) {
      const shuffled = [...markets].sort(() => Math.random() - 0.5);
      setMarkets(shuffled);
    }
  }, [activeTab]);

  return (
    <div className="w-full max-w-[1400px] mx-auto mt-8 px-6 pb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {["New", "Top Movers", "Popular"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab
                  ? "bg-black/5 dark:bg-white/10 text-[var(--foreground)]"
                  : "text-[var(--muted)] hover:text-blue-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center bg-[var(--card-bg)] rounded-lg p-1 border border-[var(--border-color)]">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "cards"
                ? "bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] p-6 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[1200px] border-collapse">
              <thead>
                <tr className="text-left text-xs text-[var(--muted)] border-b border-[var(--border-color)]">
                  <th className="pb-4 pl-4 font-medium uppercase">Coin</th>
                  <th className="pb-4 font-medium text-center uppercase">
                    Graph
                  </th>
                  <th className="pb-4 font-medium text-right uppercase">
                    Mcap
                  </th>
                  <th className="pb-4 font-medium text-left pl-8 uppercase">
                    ATH
                  </th>
                  <th className="pb-4 font-medium text-center uppercase">
                    Age
                  </th>
                  <th className="pb-4 font-medium text-right uppercase">
                    Txns
                  </th>
                  <th className="pb-4 font-medium text-right uppercase">
                    24h Vol
                  </th>
                  <th className="pb-4 font-medium text-right uppercase">
                    Traders
                  </th>
                  <th className="pb-4 font-medium text-right uppercase">5M</th>
                  <th className="pb-4 font-medium text-right uppercase">1H</th>
                  <th className="pb-4 font-medium text-right uppercase">6H</th>
                  <th className="pb-4 font-medium text-right pr-4 uppercase">
                    24H
                  </th>
                </tr>
              </thead>
              <tbody>
                {markets.map((market, index) => (
                  <tr
                    key={market.id}
                    className="border-b border-[var(--border-color)] last:border-none hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer h-16"
                  >
                    <td className="pl-4">
                      <div className="flex items-center gap-3">
                        <span className="text-[var(--muted)] text-sm w-4">
                          #{index + 1}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-[var(--foreground)] overflow-hidden">
                          <img 
                            src={market.image} 
                            alt={market.symbol}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerText = market.symbol[0];
                            }}
                          />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[var(--foreground)]">
                            {market.name}
                          </div>
                          <div className="text-xs text-[var(--muted)]">
                            {market.symbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center">
                        <Sparkline
                          data={market.chartData}
                          isPositive={market.isPositive}
                        />
                      </div>
                    </td>
                    <td className="text-right text-sm font-medium text-[var(--foreground)]">
                      {market.marketCap}
                    </td>
                    <td className="pl-8">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-[var(--input-bg)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${market.bondingCurve > 80 ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" : "bg-emerald-400"}`}
                            style={{ width: `${market.bondingCurve}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-[var(--foreground)]">
                          {market.ath}
                        </span>
                      </div>
                    </td>
                    <td className="text-center text-sm text-[var(--foreground)]">
                      {market.age}
                    </td>
                    <td className="text-right text-sm text-[var(--foreground)]">
                      {market.txns}
                    </td>
                    <td className="text-right text-sm text-[var(--foreground)]">
                      {market.volume}
                    </td>
                    <td className="text-right text-sm text-[var(--foreground)]">
                      {market.traders}
                    </td>
                    <td
                      className={`text-right text-sm font-medium ${market.change5m.startsWith("+") ? "text-emerald-500" : market.change5m === "-" ? "text-[var(--muted)]" : "text-red-500"}`}
                    >
                      {market.change5m}
                    </td>
                    <td
                      className={`text-right text-sm font-medium ${market.change1h.startsWith("+") ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {market.change1h}
                    </td>
                    <td
                      className={`text-right text-sm font-medium ${market.change6h.startsWith("+") ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {market.change6h}
                    </td>
                    <td
                      className={`text-right text-sm font-medium pr-4 ${market.change.startsWith("+") ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {market.change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {markets.map((market) => (
            <div
              key={market.id}
              className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-5 hover:border-blue-500/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-[var(--foreground)] overflow-hidden">
                    <img 
                      src={market.image} 
                      alt={market.symbol}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerText = market.symbol[0];
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--foreground)]">
                      {market.name}
                    </h3>
                    <p className="text-sm text-[var(--muted)]">
                      {market.symbol}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-sm font-bold ${market.change.startsWith("+") ? "text-emerald-500" : "text-red-500"}`}
                >
                  {market.change}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">Market Cap</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {market.marketCap}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">Age</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {market.age}
                  </span>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-xs text-[var(--muted)] mb-1">
                    <span>Bonding Curve</span>
                    <span
                      className={
                        market.bondingCurve > 80
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }
                    >
                      {market.bondingCurve}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--input-bg)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${market.bondingCurve > 80 ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" : "bg-emerald-400"}`}
                      style={{ width: `${market.bondingCurve}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
