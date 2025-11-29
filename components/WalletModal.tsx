"use client";

import { X, Copy, ExternalLink, LogOut, Wallet } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { toast } from "sonner";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { walletAddress, disconnectWallet } = useWallet();

  if (!isOpen) return null;

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success("Address copied to clipboard");
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    onClose();
    toast.success("Wallet disconnected");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Wallet className="text-[var(--primary)]" /> Wallet Details
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--input-bg)] rounded-lg p-4 border border-[var(--border-color)]">
            <p className="text-sm text-[var(--muted)] mb-1">
              Connected Address
            </p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm font-mono break-all text-[var(--foreground)]">
                {walletAddress}
              </code>
              <button
                onClick={copyAddress}
                className="p-2 hover:bg-[var(--card-bg)] rounded-lg transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
                title="Copy Address"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href={`https://preprod.cardanoscan.io/address/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[var(--input-bg)] hover:bg-[var(--border-color)] text-[var(--foreground)] py-2.5 rounded-lg font-medium transition-colors border border-[var(--border-color)]"
            >
              <ExternalLink size={16} /> View on Explorer
            </a>
            <button
              onClick={handleDisconnect}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2.5 rounded-lg font-medium transition-colors border border-red-500/20"
            >
              <LogOut size={16} /> Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
