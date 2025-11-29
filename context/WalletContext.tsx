"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { Lucid, Blockfrost } from "lucid-cardano";

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  walletName: string | null;
  showInstallGuide: boolean;
  setShowInstallGuide: (show: boolean) => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    // Check if previously connected
    const savedAddress = localStorage.getItem("walletAddress");
    const savedWalletName = localStorage.getItem("walletName");
    if (savedAddress && savedWalletName) {
      setWalletAddress(savedAddress);
      setWalletName(savedWalletName);
      setIsConnected(true);
    }
  }, []);

  const connectWallet = async () => {
    try {
      // 1. Check for Blockfrost Project ID
      const blockfrostId = process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID;
      if (!blockfrostId) {
        toast.error("Configuration Error: Blockfrost Project ID is missing. Please check your .env file.");
        return;
      }

      // 2. Check for Cardano object
      const cardano = (window as any).cardano;
      if (!cardano) {
        setShowInstallGuide(true);
        return;
      }

      // 3. Detect available wallets (CIP-30)
      // We look for standard wallet keys. 
      // Common ones: nami, eternl, lace, yoroi, flint, typhoncip30, gero, nufi
      const supportedWallets = ["nami", "eternl", "lace", "yoroi", "flint", "typhoncip30", "gero", "nufi"];
      
      // Find the first available wallet
      // In a more advanced version, we would show a modal to let the user choose.
      // For now, we prioritize Nami/Eternl/Lace if available, or just pick the first one found.
      let walletName = supportedWallets.find(name => cardano[name]);
      
      // Fallback: check if there are any other keys in cardano object that look like wallets (have .enable())
      if (!walletName) {
         const potentialWallets = Object.keys(cardano).filter(key => 
            typeof cardano[key] === 'object' && 
            cardano[key] !== null && 
            'enable' in cardano[key]
         );
         if (potentialWallets.length > 0) {
            walletName = potentialWallets[0];
         }
      }

      if (!walletName) {
        toast.error("No supported Cardano wallet found. Please install Nami, Eternl, or Lace.");
        return;
      }

      toast.info(`Connecting to ${walletName}...`);

      // 4. Connect to wallet
      const api = await cardano[walletName].enable();
      
      // 5. Get Address
      // We use the raw API to get the address first to be quick
      let addresses = await api.getUsedAddresses();
      if (addresses.length === 0) {
        addresses = await api.getUnusedAddresses();
      }
      
      if (addresses.length === 0) {
        toast.error("No addresses found in wallet.");
        return;
      }

      // 6. Initialize Lucid for proper address decoding and future transactions
      const { initLucid } = await import("../lib/cardano");
      const lucid = await initLucid(api);
      const bech32Address = await lucid.wallet.address();
      
      setWalletAddress(bech32Address);
      setWalletName(walletName);
      setIsConnected(true);
      localStorage.setItem("walletAddress", bech32Address);
      localStorage.setItem("walletName", walletName);

      // 7. Save/Update User in Firebase
      try {
        const { db } = await import("../lib/firebase");
        const { doc, getDoc, setDoc, serverTimestamp } = await import("firebase/firestore");
        
        const userRef = doc(db, "users", bech32Address);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // Create new user
          await setDoc(userRef, {
            walletAddress: bech32Address,
            username: `User_${bech32Address.slice(0, 6)}`, // Default username
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            coinsCreated: 0,
            coinsHeld: 0,
            followers: 0,
            following: 0,
            friends: 0,
            metadata: {}
          });
          toast.success("Profile created!");
        } else {
          // Update last login
          await setDoc(userRef, {
            lastLogin: serverTimestamp()
          }, { merge: true });
        }
      } catch (firebaseError) {
        console.error("Error saving user to Firebase:", firebaseError);
        // Don't block wallet connection if firebase fails, just log it
      }

      toast.success("Wallet connected successfully!");
      
    } catch (error: any) {
      console.error("Wallet connection failed", error);
      // Handle specific errors
      if (error.info && error.info.includes("User declined")) {
         toast.error("Connection rejected by user.");
      } else if (error.message && error.message.includes("Blockfrost")) {
         toast.error("Blockfrost configuration error. Check console for details.");
      } else {
         toast.error(error.message || "Failed to connect wallet.");
      }
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setWalletName(null);
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("walletName");
  };

  return (
    <WalletContext.Provider
      value={{ isConnected, walletAddress, walletName, showInstallGuide, setShowInstallGuide, connectWallet, disconnectWallet }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
