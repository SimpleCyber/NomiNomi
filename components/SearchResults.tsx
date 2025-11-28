"use client";

import { Sprout, User, MessageCircle } from "lucide-react";
import { SEARCH_RESULTS } from "@/data/constants";

interface SearchResultsProps {
  onClose: () => void;
}

export default function SearchResults({ onClose }: SearchResultsProps) {
  return (
    <div className="absolute top-full left-0 w-full mt-2 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] shadow-2xl overflow-hidden z-50">
      <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
        {/* Coins Section */}
        <div className="p-2">
          {SEARCH_RESULTS.coins.map((coin, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg cursor-pointer group transition-colors"
              onClick={onClose}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden text-xs font-bold text-[var(--foreground)]">
                  {/* Placeholder Image */}
                  {coin.name[0]}
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
          ))}
        </div>

        {/* Users Section */}
        <div className="p-2 border-t border-[var(--border-color)]">
          <h3 className="text-xs font-semibold text-[var(--muted)] px-2 mb-2">
            Users
          </h3>
          {SEARCH_RESULTS.users.map((user, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg cursor-pointer group transition-colors"
              onClick={onClose}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden text-[var(--foreground)]">
                  <User size={16} />
                </div>
                <div>
                  <div className="font-bold text-sm text-[var(--foreground)]">
                    {user.name}
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    {user.followers}
                  </div>
                </div>
              </div>
              <button className="w-8 h-8 rounded-lg bg-green-500 hover:bg-green-600 flex items-center justify-center text-black transition-colors">
                <MessageCircle size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
