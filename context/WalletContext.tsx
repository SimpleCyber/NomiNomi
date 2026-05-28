"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { useWallet as useSolanaWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Connection, Transaction } from "@solana/web3.js";

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  walletName: string | null;
  publicKey: PublicKey | null;
  connection: Connection;
  sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>;
  showInstallGuide: boolean;
  setShowInstallGuide: (show: boolean) => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { connected, publicKey, wallet, disconnect, sendTransaction } = useSolanaWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();
  
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      const address = publicKey.toBase58();
      setWalletAddress(address);
      setWalletName(wallet?.adapter.name || "Solana Wallet");
      
      // Update Firebase
      syncUserWithFirebase(address);
    } else {
      setWalletAddress(null);
      setWalletName(null);
    }
  }, [connected, publicKey, wallet]);

  const syncUserWithFirebase = async (address: string) => {
    try {
      const { db } = await import("../lib/firebase");
      const { doc, getDoc, setDoc, serverTimestamp } = await import("firebase/firestore");

      const userRef = doc(db, "users", address);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          walletAddress: address,
          username: `User_${address.slice(0, 6)}`,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          coinsCreated: 0,
          coinsHeld: 0,
          followers: 0,
          following: 0,
          friends: 0,
          metadata: { blockchain: "solana" },
        });
        toast.success("Profile created!");
      } else {
        await setDoc(
          userRef,
          {
            lastLogin: serverTimestamp(),
            "metadata.blockchain": "solana"
          },
          { merge: true },
        );
      }
    } catch (firebaseError) {
      console.error("Error saving user to Firebase:", firebaseError);
    }
  };

  const connectWallet = async () => {
    try {
      setVisible(true);
    } catch (error: any) {
      console.error("Wallet connection failed", error);
      toast.error(error.message || "Failed to connect wallet.");
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Disconnect failed", error);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected: connected,
        walletAddress,
        walletName,
        publicKey,
        connection,
        sendTransaction,
        showInstallGuide,
        setShowInstallGuide,
        connectWallet,
        disconnectWallet,
      }}
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
