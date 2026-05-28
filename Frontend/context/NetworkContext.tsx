"use client";

import React, { createContext, useContext, useState, useEffect, FC } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

type NetworkMode = "devnet" | "mainnet-beta";

interface NetworkContextType {
  network: NetworkMode;
  setNetwork: (n: NetworkMode) => void;
  isDevnet: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  network: "devnet",
  setNetwork: () => {},
  isDevnet: true,
});

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [network, setNetwork] = useState<NetworkMode>("devnet");

  // Sync network setting from Firestore (admin panel writes here)
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "platform_stats", "global"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.solanaNetwork === "mainnet-beta" || data.solanaNetwork === "devnet") {
          setNetwork(data.solanaNetwork);
        }
      }
    });
    return () => unsub();
  }, []);

  return (
    <NetworkContext.Provider value={{ network, setNetwork, isDevnet: network === "devnet" }}>
      {children}
    </NetworkContext.Provider>
  );
};
