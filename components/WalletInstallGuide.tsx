"use client";

import { ExternalLink } from "lucide-react";

interface WalletInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const wallets = [
  {
    name: "Eternl",
    description: "Feature-rich wallet",
    icon: "🔷",
    chromeUrl:
      "https://chrome.google.com/webstore/detail/eternl/kmhcihpebfmpgmihbkipmjlmmioameka",
    firefoxUrl: "https://addons.mozilla.org/en-US/firefox/addon/eternl/",
    edgeUrl:
      "https://microsoftedge.microsoft.com/addons/detail/eternl/dkdgdkdkdkdkdkdkdkdkdkdk",
  },
  {
    name: "Nami",
    description: "Simple & user-friendly",
    icon: "🌊",
    chromeUrl:
      "https://chrome.google.com/webstore/detail/nami/lpfcbjknijpeeillifnkikgncikgfhdo",
    firefoxUrl: "https://addons.mozilla.org/en-US/firefox/addon/nami-wallet/",
    edgeUrl: "https://microsoftedge.microsoft.com/addons/detail/nami/nami",
  },
  {
    name: "Lace",
    description: "Modern by Input Output",
    icon: "🎴",
    chromeUrl:
      "https://chrome.google.com/webstore/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk",
    firefoxUrl: "https://addons.mozilla.org/en-US/firefox/addon/lace-wallet/",
    edgeUrl: "https://microsoftedge.microsoft.com/addons/detail/lace/lace",
  },
  {
    name: "Yoroi",
    description: "Light wallet by Emurgo",
    icon: "⚡",
    chromeUrl:
      "https://chrome.google.com/webstore/detail/yoroi/ffnbelfdoeiohenkjibnmadjiehjhajb",
    firefoxUrl: "https://addons.mozilla.org/en-US/firefox/addon/yoroi/",
    edgeUrl: "https://microsoftedge.microsoft.com/addons/detail/yoroi/yoroi",
  },
];

export default function WalletInstallGuide({
  isOpen,
  onClose,
}: WalletInstallGuideProps) {
  if (!isOpen) return null;

  const detectBrowser = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("edg")) return "edge";
    if (userAgent.includes("firefox")) return "firefox";
    return "chrome";
  };

  const getInstallUrl = (wallet: (typeof wallets)[0]) => {
    const browser = detectBrowser();
    if (browser === "firefox") return wallet.firefoxUrl;
    if (browser === "edge") return wallet.edgeUrl;
    return wallet.chromeUrl;
  };

  return (
    <div className="absolute top-full right-0 w-80 mt-2 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-3 border-b border-[var(--border-color)] bg-[var(--input-bg)]">
        <h3 className="font-bold text-sm">Install a Cardano Wallet</h3>
        <p className="text-xs text-[var(--muted)] mt-0.5">
          Choose a wallet to get started
        </p>
      </div>

      <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
        <div className="p-2">
          {wallets.map((wallet) => (
            <a
              key={wallet.name}
              href={getInstallUrl(wallet)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg cursor-pointer group transition-colors mb-1"
              onClick={onClose}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="text-2xl">{wallet.icon}</div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-[var(--foreground)]">
                    {wallet.name}
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    {wallet.description}
                  </div>
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[var(--primary)] hover:bg-violet-700 flex items-center justify-center text-white transition-colors opacity-0 group-hover:opacity-100">
                <ExternalLink size={14} />
              </div>
            </a>
          ))}
        </div>

        <div className="p-3 bg-blue-500/10 border-t border-blue-500/20 text-xs text-[var(--foreground)]">
          <strong>After installing:</strong> Refresh this page and click
          "Connect Wallet" again.
        </div>
      </div>
    </div>
  );
}
