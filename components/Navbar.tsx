"use client";

import Link from "next/link";
import { Search, Menu, PlusCircle } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-[var(--background)] text-[var(--foreground)] border-b border-[var(--border-color)]">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center bg-[var(--input-bg)] rounded-lg px-3 py-1.5 border border-[var(--border-color)] focus-within:border-blue-500 transition-colors w-full max-w-md">
          <Search className="w-4 h-4 text-[var(--muted)] mr-2" />
          <input
            type="text"
            placeholder="Search markets"
            className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--muted)] w-full"
          />
          <div className="text-xs text-[var(--muted)] border border-[var(--border-color)] rounded px-1.5 py-0.5">
            /
          </div>
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
           <button className="w-full py-2 text-sm font-medium text-white bg-blue-600 rounded-lg">Sign up</button>
        </div>
      )}
    </nav>
  );
}
