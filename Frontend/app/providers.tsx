"use client";

import { ThemeProvider } from "next-themes";
import { WalletProvider } from "@/context/WalletContext";
import { SolanaWalletProvider } from "@/context/SolanaWalletProvider";
import { NetworkProvider } from "@/context/NetworkContext";
import { LiveStreamProvider } from "@/context/LiveStreamContext";
import { GlobalLiveStreamPlayer } from "@/components/GlobalLiveStreamPlayer";
import { DevnetBanner } from "@/components/DevnetBanner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NetworkProvider>
        <SolanaWalletProvider>
          <WalletProvider>
            <LiveStreamProvider>
              {children}
              <GlobalLiveStreamPlayer />
              <DevnetBanner />
            </LiveStreamProvider>
          </WalletProvider>
        </SolanaWalletProvider>
      </NetworkProvider>
    </ThemeProvider>
  );
}
