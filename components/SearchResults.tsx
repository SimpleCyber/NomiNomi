/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Sprout, User, MessageCircle } from "lucide-react";
import { SEARCH_RESULTS } from "@/data/constants";
import { useState, useEffect } from "react";
import { searchUsers, UserProfile } from "@/lib/user";
import { searchCoins } from "@/lib/coin";
import { Market } from "@/data/constants";
import { useRouter } from "next/navigation";

interface SearchResultsProps {
  onClose: () => void;
  searchQuery?: string;
}

export default function SearchResults({ onClose, searchQuery = "" }: SearchResultsProps) {
  const [userResults, setUserResults] = useState<UserProfile[]>([]);
  const [coinResults, setCoinResults] = useState<Market[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const [users, coins] = await Promise.all([
            searchUsers(searchQuery),
            searchCoins(searchQuery)
          ]);
          setUserResults(users);
          setCoinResults(coins);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setUserResults([]);
        setCoinResults([]);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleUserClick = (walletAddress: string) => {
    router.push(`/profile/${walletAddress}`);
    onClose();
  };

  const handleCoinClick = (coinId: number | string) => {
    router.push(`/token/${coinId}`); 
    onClose();
  };

  return (
    <div className="absolute top-full left-0 w-full mt-2 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] shadow-2xl overflow-hidden z-50">
      <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
        {/* Coins Section */}
        <div className="p-2">
          <h3 className="text-xs font-semibold text-[var(--muted)] px-2 mb-2 uppercase tracking-wider">
            Coins {isSearching && "(Searching...)"}
          </h3>
          {coinResults.length > 0 ? (
            coinResults.map((coin) => (
              <div
                key={coin.id}
                className="flex items-center justify-between p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg cursor-pointer group transition-colors"
                onClick={() => handleCoinClick(coin.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden text-xs font-bold text-[var(--foreground)] relative">
                    {/* Placeholder Image */}
                    <img src={coin.image} alt={coin.name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <span className="absolute inset-0 flex items-center justify-center -z-10">{coin.name[0]}</span>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[var(--foreground)]">
                      {coin.name}
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {coin.symbol}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-[var(--foreground)]">
                    {coin.price}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-xs text-[var(--muted)] border border-[var(--border-color)] rounded px-1.5 py-0.5 mt-1">
                    <Sprout size={10} />
                    <span>{coin.age}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-[var(--muted)]">
              {searchQuery.trim() ? "No coins found." : "Type to search coins..."}
            </div>
          )}
        </div>

        {/* Users Section */}
        <div className="p-2 border-t border-[var(--border-color)]">
          <h3 className="text-xs font-semibold text-[var(--muted)] px-2 mb-2 uppercase tracking-wider">
            Users {isSearching && "(Searching...)"}
          </h3>
          {userResults.length > 0 ? (
            userResults.map((user) => (
              <div
                key={user.walletAddress}
                className="flex items-center justify-between p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg cursor-pointer group transition-colors"
                onClick={() => handleUserClick(user.walletAddress)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden text-[var(--foreground)]">
                    <User size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[var(--foreground)]">
                      {user.username}
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {user.followers} followers
                    </div>
                  </div>
                </div>
                <button
                  className="w-8 h-8 rounded-lg bg-green-500 hover:bg-green-600 flex items-center justify-center text-black transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/chat?chatWith=${user.walletAddress}`);
                    onClose();
                  }}
                >
                  <MessageCircle size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-[var(--muted)]">
              {searchQuery.trim() ? "No users found." : "Type to search users..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
