"use client";

import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { useNetwork } from '@/context/NetworkContext';

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';

export const SolanaWalletProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const { network: networkMode } = useNetwork();

    const network = networkMode === "mainnet-beta" 
        ? WalletAdapterNetwork.Mainnet 
        : WalletAdapterNetwork.Devnet;

    const endpoint = useMemo(() => 
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network), 
        [network]
    );

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
