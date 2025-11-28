"use client";

import { RefreshCcw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function SwapPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar />
      <div className="flex flex-col min-h-screen md:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-in-out">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="w-full max-w-[1200px] mx-auto">
            {/* Main Layout Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              {/* LEFT SIDE → Header + Description */}
              <div className="space-y-6 order-2 md:order-1">
                <div className="text-left space-y-4 py-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <RefreshCcw size={28} className="text-white" />
                    </div>
                  </div>

                  <h1 className="text-4xl font-bold text-[var(--foreground)]">
                    Swap Tokens
                  </h1>

                  <p className="text-[var(--muted)] text-lg max-w-md">
                    Trade your tokens instantly with the best rates powered by
                    HoudiniSwap. Fast, secure, and decentralized.
                  </p>
                </div>

                {/* Info Section */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20 p-6">
                  <h3 className="font-semibold text-[var(--foreground)] mb-2">
                    Important Information
                  </h3>
                  <ul className="space-y-2 text-sm text-[var(--muted)]">
                    <li>
                      • Always verify the token contract address before swapping
                    </li>
                    <li>
                      • Check the slippage tolerance to avoid failed
                      transactions
                    </li>
                    <li>• Ensure you have enough gas fees in your wallet</li>
                    <li>
                      • Double-check the swap details before confirming the
                      transaction
                    </li>
                  </ul>
                </div>
              </div>

              {/* RIGHT SIDE → Token Swap Iframe */}
             <div className="order-1 md:order-2 bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] overflow-hidden w-full sm:w-[400px] md:w-[500px]">
  <div className="relative w-full" style={{ maxHeight: "600px" }}>
    <iframe
      src="https://houdiniswap.com"
      className="w-full h-full border-0"
      style={{ minHeight: "600px" }}
      title="HoudiniSwap Token Swap Interface"
      allow="clipboard-read; clipboard-write"
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
    />
  </div>
</div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
