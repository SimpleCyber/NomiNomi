"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface CoinData {
    id: string | number;
    name: string;
    symbol: string;
    image: string;
}

interface LiveStreamContextType {
    isLive: boolean;
    isMinimized: boolean;
    channelName: string | null;
    role: "host" | "audience";
    coinData: CoinData | null;
    startStream: (channel: string, coin: CoinData) => void;
    joinStream: (channel: string, coin: CoinData) => void;
    leaveStream: () => void;
    minimize: () => void;
    maximize: () => void;
}

const LiveStreamContext = createContext<LiveStreamContextType | undefined>(undefined);

export function LiveStreamProvider({ children }: { children: ReactNode }) {
    const [isLive, setIsLive] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [channelName, setChannelName] = useState<string | null>(null);
    const [role, setRole] = useState<"host" | "audience">("audience");
    const [coinData, setCoinData] = useState<CoinData | null>(null);

    const startStream = (channel: string, coin: CoinData) => {
        setChannelName(channel);
        setCoinData(coin);
        setRole("host");
        setIsLive(true);
        setIsMinimized(false);
    };

    const joinStream = (channel: string, coin: CoinData) => {
        setChannelName(channel);
        setCoinData(coin);
        setRole("audience");
        setIsLive(true);
        setIsMinimized(false);
    };

    const leaveStream = () => {
        setIsLive(false);
        setChannelName(null);
        setCoinData(null);
        setIsMinimized(false);
    };

    const minimize = () => setIsMinimized(true);
    const maximize = () => setIsMinimized(false);

    return (
        <LiveStreamContext.Provider
            value={{
                isLive,
                isMinimized,
                channelName,
                role,
                coinData,
                startStream,
                joinStream,
                leaveStream,
                minimize,
                maximize,
            }}
        >
            {children}
        </LiveStreamContext.Provider>
    );
}

export function useLiveStream() {
    const context = useContext(LiveStreamContext);
    if (context === undefined) {
        throw new Error("useLiveStream must be used within a LiveStreamProvider");
    }
    return context;
}
