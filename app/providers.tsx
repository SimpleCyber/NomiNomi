"use client";

import { ThemeProvider } from "next-themes";
import { WalletProvider } from "@/context/WalletContext";
import { LiveStreamProvider } from "@/context/LiveStreamContext";
import { GlobalLiveStreamPlayer } from "@/components/GlobalLiveStreamPlayer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <WalletProvider>
        <LiveStreamProvider>
          {children}
          <GlobalLiveStreamPlayer />
        </LiveStreamProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}
