"use client";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import CreateCoin from "@/components/CreateCoin";
import { useWallet } from "@/context/WalletContext";

export default function CreateCoinPage() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans">
        <Sidebar />
        <div className="flex flex-col min-h-screen md:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-in-out">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                Please connect your wallet
              </h2>
              <p className="text-[var(--muted)]">
                Connect your wallet to create a coin.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar />
      <div className="flex flex-col min-h-screen md:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-in-out">
        <Navbar />
        <div className="flex-1 overflow-y-auto pt-4">
          <CreateCoin />
        </div>
      </div>
    </main>
  );
}
