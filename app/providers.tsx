"use client";

import { ThemeProvider } from "next-themes";
import { WalletProvider } from "@/context/WalletContext";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <WalletProvider>
        {children}
        <Toaster position="bottom-right" theme="system" />
      </WalletProvider>
    </ThemeProvider>
  );
}
