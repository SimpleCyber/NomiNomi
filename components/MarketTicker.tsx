"use client";

import { LayoutGrid, List, Loader2, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { Market } from "@/data/constants";
import { Sparkline } from "@/components/ui/Sparkline";
import { useConnection } from "@solana/wallet-adapter-react";
import { fetchOnChainMintData } from "@/lib/transactions";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { useNetwork } from "@/context/NetworkContext";
import Link from "next/link";

export default function MarketTicker() {
  const [activeTab, setActiveTab] = useState("Spot");
  const [viewMode, setViewMode] = useState<"list" | "cards">("cards");
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const { connection } = useConnection();
  const { isDevnet } = useNetwork();
  const explorerCluster = isDevnet ? "?cluster=devnet" : "";

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        // Step 1: Get mint addresses from Firestore (lightweight index)
        const q = query(
          collection(db, "memecoins"),
          where("status", "==", "MINTED"),
          orderBy("createdAt", "desc"),
          limit(50)
        );
        const snapshot = await getDocs(q);
        const mintAddresses = snapshot.docs
          .map(doc => doc.data().mintAddress)
          .filter(Boolean) as string[];

        if (mintAddresses.length === 0) {
          setMarkets([]);
          setIsLoading(false);
          return;
        }

        // Step 2: Fetch actual token data from Solana blockchain
        const onChainData = await fetchOnChainMintData(connection, mintAddresses);

        const fetchedMarkets: Market[] = onChainData.map((mint: any) => ({
          id: mint.id,
          name: mint.name || "Unknown",
          symbol: mint.symbol || "UNK",
          price: "$0.00",
          volume: "0 SOL",
          marketCap: "0 SOL",
          change: "0%",
          change5m: "0%",
          change1h: "0%",
          change6h: "0%",
          isPositive: true,
          chartData: [],
          bondingCurve: 0,
          ath: "$0",
          age: "New",
          txns: 0,
          traders: 0,
          image: mint.image || "/placeholder.png",
          description: mint.description || "",
          creatorAddress: "",
        }));

        setMarkets(fetchedMarkets);
      } catch (error) {
        console.error("Error fetching markets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkets();
    const interval = setInterval(fetchMarkets, 60000);
    return () => clearInterval(interval);
  }, [connection]);

  // Pagination Logic
  const totalPages = Math.ceil(markets.length / ITEMS_PER_PAGE);
  const paginatedMarkets = markets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--muted)]" />
        </div>
      ) : (
        <>
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
                      <th className="pb-4 font-medium text-right uppercase">
                        5M
                      </th>
                      <th className="pb-4 font-medium text-right uppercase">
                        1H
                      </th>
                      <th className="pb-4 font-medium text-right uppercase">
                        6H
                      </th>
                      <th className="pb-4 font-medium text-right pr-4 uppercase">
                        24H
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMarkets.map((market, index) => (
                      <tr
                        key={market.id}
                        className="border-b border-[var(--border-color)] last:border-none hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer h-16"
                      >
                        <td className="pl-4">
                          <Link
                            href={`/token/${market.id}`}
                            className="flex items-center gap-3 w-full h-full"
                          >
                            <span className="text-[var(--muted)] text-sm w-4">
                              #{index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-[var(--foreground)] overflow-hidden">
                              {/* Placeholder for image */}
                              <img
                                src={market.image}
                                alt={market.symbol}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  e.currentTarget.parentElement!.innerText =
                                    market.symbol[0];
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
                          </Link>
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
                              {market.bondingCurve.toFixed(2)}%
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
              {paginatedMarkets.map((market) => (
                <Link
                  href={`/token/${market.id}`}
                  key={market.id}
                  className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 hover:border-blue-500/50 transition-colors cursor-pointer group flex gap-4"
                >
                  {/* Left: Image */}
                  <div className="w-32 h-32 flex-shrink-0">
                    <div className="w-full h-full rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                      {/* Placeholder for image - using market.image if available or symbol char */}
                      <img
                        src={market.image}
                        alt={market.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement?.classList.add(
                            "flex",
                            "items-center",
                            "justify-center",
                          );
                          e.currentTarget.parentElement!.innerHTML = `<span class="text-4xl font-bold text-[var(--foreground)]">${market.symbol[0]}</span>`;
                        }}
                      />
                    </div>
                  </div>

                  {/* Right: Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      {/* Header: Name & Ticker */}
                        <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-[var(--foreground)] text-sm truncate">
                          {market.name}
                        </h3>
                        <span className="text-xs text-[var(--muted)] truncate">
                          {market.symbol}
                        </span>
                        {market.id && String(market.id).length > 20 && (
                          <a
                            href={`https://explorer.solana.com/address/${market.id}${explorerCluster}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-blue-500/10 text-[var(--muted)] hover:text-blue-500 shrink-0"
                            title="View on Solana Explorer"
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>

                      {/* Creator Info */}
                      <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] mb-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <span className="text-[8px]">👤</span>
                        </div>
                        <span className="truncate">
                          {market.creatorAddress
                            ? `Created by ${market.creatorAddress.slice(0, 4)}...${market.creatorAddress.slice(-4)}`
                            : "Created by Dev"}
                        </span>
                        <span>•</span>
                        <span>{market.age} ago</span>
                      </div>

                      {/* Market Cap & Progress */}
                      <div className="mb-1">
                        <div className="flex items-center gap-2 text-xs mb-1">
                          <span className="text-[var(--muted)]">MC</span>
                          <span className="font-bold text-[var(--foreground)]">
                            {market.marketCap}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-[var(--input-bg)] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${market.isPositive ? "bg-emerald-400" : "bg-red-400"}`}
                              style={{ width: `${market.bondingCurve}%` }}
                            ></div>
                          </div>
                          <span
                            className={`text-xs font-medium ${market.isPositive ? "text-emerald-500" : "text-red-500"}`}
                          >
                            {market.bondingCurve.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description + Explorer Link */}
                    <div className="flex items-end justify-between mt-1">
                      <p className="text-xs text-[var(--muted)] line-clamp-2 flex-1">
                        {market.description ||
                          `${market.name} is a community driven project on Solana. Join the movement!`}
                      </p>
                      {market.id && String(market.id).length > 20 && (
                        <a
                          href={`https://explorer.solana.com/address/${market.id}${explorerCluster}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="ml-2 shrink-0 flex items-center gap-1 text-[10px] font-bold text-[var(--muted)] hover:text-blue-500 transition-colors px-1.5 py-0.5 rounded-md hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20"
                          title="View on Solana Explorer"
                        >
                          <svg viewBox="0 0 397.7 311.7" className="w-3 h-3" fill="currentColor"><path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"/><path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"/><path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"/></svg>
                          Explorer
                        </a>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--input-bg)] transition-colors"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-blue-500 text-white"
                          : "bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)] hover:bg-[var(--input-bg)]"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--input-bg)] transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
