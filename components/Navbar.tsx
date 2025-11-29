"use client";

import Link from "next/link";
import {
  Search,
  PlusCircle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { SidebarContent } from "./Sidebar";
import SearchResults from "./SearchResults";
import { useWallet } from "@/context/WalletContext";
import { User, ChevronDown } from "lucide-react";
import WalletModal from "./WalletModal";
import WalletInstallGuide from "./WalletInstallGuide";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isConnected, walletAddress, connectWallet, showInstallGuide, setShowInstallGuide } = useWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const walletDropdownRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close wallet install guide when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        walletDropdownRef.current &&
        !walletDropdownRef.current.contains(event.target as Node)
      ) {
        setShowInstallGuide(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowInstallGuide]);

  return (
    <nav className="bg-[var(--background)] text-[var(--foreground)] border-b border-[var(--border-color)] relative z-50">
      <div className="max-w-[1400px] mx-auto px-6 h-[63px] flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
            className="md:hidden text-[var(--muted)] hover:text-[var(--foreground)] mr-3"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <img src="./image.png" alt="" className="w-7 h-7" />
          </button>
          
        {/* Search Bar */}
        <div className="relative w-full max-w-md" ref={searchRef}>
          <div
            className={`flex items-center bg-[var(--input-bg)] rounded-lg px-3 py-1.5 border transition-colors w-full ${showResults ? "border-green-500 ring-1 ring-green-500" : "border-[var(--border-color)] focus-within:border-blue-500"}`}
          >
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
            <SearchResults onClose={() => setShowResults(false)} />
          )}
        </div>

        <div className="flex items-center gap-3 flex-row-reverse flex">
          <div className="hidden md:flex items-center gap-3">
            <Link href="/createcoin">
            <button className="px-4 py-1.5 text-sm font-medium text-white bg-[var(--primary)] hover:bg-violet-700 rounded-lg transition-colors flex items-center ">
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Coin
            </button>
            </Link>
            {isConnected ? (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--foreground)] bg-[var(--input-bg)] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors border border-[var(--border-color)]"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white">
                  <User size={14} />
                </div>
                <span>
                  {walletAddress ? `${walletAddress.slice(0, 5)}...${walletAddress.slice(-5)}` : "Connected"}
                </span>
                <ChevronDown size={14} className="text-[var(--muted)]" />
              </button>
            ) : (
              <div className="relative" ref={walletDropdownRef}>
                <button
                  onClick={connectWallet}
                  className="px-4 py-1.5 text-sm font-medium text-[var(--foreground)] bg-[var(--input-bg)] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors border border-[var(--border-color)]"
                >
                  Connect Wallet
                </button>
                <WalletInstallGuide
                  isOpen={showInstallGuide}
                  onClose={() => setShowInstallGuide(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />

      {/* Mobile Sidebar */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Sidebar */}
          <div className="relative w-64 h-full shadow-xl animate-in slide-in-from-left duration-300">
            <SidebarContent
              isCollapsed={false}
              isMobile={true}
              onClose={() => setIsMenuOpen(false)}
            />
          </div>
        </div>
      )}
    </nav>
  );
}
