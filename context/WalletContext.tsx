"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { Lucid, Blockfrost } from "lucid-cardano";
import WalletSelectorModal from "../components/WalletSelectorModal";

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
  
  // New state for wallet selection
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);
  const [showWalletSelector, setShowWalletSelector] = useState(false);

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
      const supportedWallets = ["nami", "eternl", "lace", "yoroi", "flint", "typhoncip30", "gero", "nufi"];
      
      // Find all available wallets
      const foundWallets = supportedWallets.filter(name => cardano[name]);
      
      // Fallback: check for other keys
      if (foundWallets.length === 0) {
         const potentialWallets = Object.keys(cardano).filter(key => 
            typeof cardano[key] === 'object' && 
            cardano[key] !== null && 
            'enable' in cardano[key]
         );
         foundWallets.push(...potentialWallets);
      }

      if (foundWallets.length === 0) {
        toast.error("No supported Cardano wallet found. Please install Nami, Eternl, or Lace.");
        return;
      }

      // If multiple wallets found, show selector
      if (foundWallets.length > 1) {
        setAvailableWallets(foundWallets);
        setShowWalletSelector(true);
        return;
      }

      // If only one wallet, connect directly
      await selectWallet(foundWallets[0]);

    } catch (error: any) {
      console.error("Wallet connection initialization failed", error);
      toast.error(error.message || "Failed to initialize wallet connection.");
    }
  };

  const selectWallet = async (selectedWalletName: string) => {
    try {
      setShowWalletSelector(false);
      const cardano = (window as any).cardano;
      
      toast.info(`Connecting to ${selectedWalletName}...`);

      // 4. Connect to wallet
      const api = await cardano[selectedWalletName].enable();
      
      // 5. Get Address
      let addresses = await api.getUsedAddresses();
      if (addresses.length === 0) {
        addresses = await api.getUnusedAddresses();
      }
      
      if (addresses.length === 0) {
        toast.error("No addresses found in wallet.");
        return;
      }

      // 6. Initialize Lucid
      const { initLucid } = await import("../lib/cardano");
      const lucid = await initLucid(api);
      const bech32Address = await lucid.wallet.address();
      
      setWalletAddress(bech32Address);
      setWalletName(selectedWalletName);
      setIsConnected(true);
      localStorage.setItem("walletAddress", bech32Address);
      localStorage.setItem("walletName", selectedWalletName);

      // 7. Save/Update User in Firebase
      try {
        const { db } = await import("../lib/firebase");
        const { doc, getDoc, setDoc, serverTimestamp } = await import("firebase/firestore");
        
        const userRef = doc(db, "users", bech32Address);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            walletAddress: bech32Address,
            username: `User_${bech32Address.slice(0, 6)}`,
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
          await setDoc(userRef, {
            lastLogin: serverTimestamp()
          }, { merge: true });
        }
      } catch (firebaseError) {
        console.error("Error saving user to Firebase:", firebaseError);
      }

      toast.success("Wallet connected successfully!");
      
    } catch (error: any) {
      console.error("Wallet connection failed", error);
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
      {/* Dynamic import or conditional render for the modal to avoid circular deps if any, though direct import is fine usually */}
      <WalletSelectorModal 
        isOpen={showWalletSelector}
        onClose={() => setShowWalletSelector(false)}
        wallets={availableWallets}
        onSelect={selectWallet}
      />
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
