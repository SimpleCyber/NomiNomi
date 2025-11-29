"use client";

import { X, Wallet } from "lucide-react";

interface WalletSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: string[];
  onSelect: (walletName: string) => void;
}

export default function WalletSelectorModal({ 
  isOpen, 
  onClose, 
  wallets, 
  onSelect 
}: WalletSelectorModalProps) {
  if (!isOpen) return null;

  // Helper to format wallet names nicely (e.g. "nami" -> "Nami")
  const formatName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Wallet className="text-[var(--primary)]" /> Select Wallet
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-[var(--muted)] mb-4">
            Multiple wallets detected. Please select one to connect.
          </p>
          
          {wallets.map((wallet) => (
            <button
              key={wallet}
              onClick={() => onSelect(wallet)}
              className="w-full flex items-center justify-between p-4 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] hover:bg-[var(--border-color)] transition-all group"
            >
              <span className="font-medium text-[var(--foreground)]">
                {formatName(wallet)}
              </span>
              <div className="w-2 h-2 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
