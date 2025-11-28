"use client";

import Link from "next/link";
import { Search, Menu, PlusCircle, MessageCircle, Sprout, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// Mock Data for Search
const mockSearchResults = {
  coins: [
    { name: "LIL", symbol: "LIL Bits", price: "$746.7K", age: "1 month", image: "/lil.png" },
    { name: "BUTTCOIN", symbol: "The Next Bitcoin", price: "$540.5K", age: "10 months", image: "/buttcoin.png" },
    { name: "BITCAT", symbol: "Bitcat", price: "$167.4K", age: "1 year", image: "/bitcat.png" },
    { name: "SBR", symbol: "Strategic Bitcoin Reserve", price: "$141.6K", age: "1 year", image: "/sbr.png" },
  ],
  users: [
    { name: "bitch", followers: "0 followers", image: "/pepe.png" },
    { name: "Bitcoin", followers: "12 followers", image: "/pepe-green.png" },
  ]
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-[var(--background)] text-[var(--foreground)] border-b border-[var(--border-color)] relative z-50">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full max-w-md" ref={searchRef}>
          <div className={`flex items-center bg-[var(--input-bg)] rounded-lg px-3 py-1.5 border transition-colors w-full ${showResults ? 'border-green-500 ring-1 ring-green-500' : 'border-[var(--border-color)] focus-within:border-blue-500'}`}>
            <Search className="w-4 h-4 text-[var(--muted)] mr-2" />
            <input
              type="text"
              placeholder="Search markets"
              className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--muted)] w-full"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(e.target.value.length > 0);
              }}
              onFocus={() => {
                if (searchQuery.length > 0) setShowResults(true);
              }}
            />
            <div className="text-xs text-[var(--muted)] border border-[var(--border-color)] rounded px-1.5 py-0.5">
              /
            </div>
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 w-full mt-2 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] shadow-2xl overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                {/* Coins Section */}
                <div className="p-2">
                  {mockSearchResults.coins.map((coin, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                           {/* Placeholder Image */}
                           <div className="text-xs font-bold">{coin.name[0]}</div>
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[var(--foreground)]">{coin.name}</div>
                          <div className="text-xs text-[var(--muted)]">{coin.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-[var(--foreground)]">{coin.price}</div>
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
                  <h3 className="text-xs font-semibold text-[var(--muted)] px-2 mb-2">Users</h3>
                  {mockSearchResults.users.map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                           <User size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[var(--foreground)]">{user.name}</div>
                          <div className="text-xs text-[var(--muted)]">{user.followers}</div>
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
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <button className="px-4 py-1.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors flex items-center ">
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Coin
            </button>
            <button className="px-4 py-1.5 text-sm font-medium text-[var(--foreground)] bg-[var(--input-bg)] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors border border-[var(--border-color)]">
              Log in
            </button>
          </div>

          <button
            className="md:hidden text-[var(--muted)] hover:text-[var(--foreground)]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-[var(--background)] border-b border-[var(--border-color)] p-4 flex flex-col gap-4 md:hidden z-50">
           <Link href="#" className="text-[var(--muted)] hover:text-[var(--foreground)]">Spot</Link>
           <Link href="#" className="text-[var(--muted)] hover:text-[var(--foreground)]">Futures</Link>
           <Link href="#" className="text-[var(--muted)] hover:text-[var(--foreground)]">Lend</Link>
           <div className="h-px bg-[var(--border-color)] my-2"></div>
           <button className="w-full py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--input-bg)] rounded-lg">Log in</button>
        </div>
      )}
    </nav>
  );
}
