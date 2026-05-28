"use client";

import { useState, useEffect, useMemo } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
    AgoraRTCProvider,
    LocalUser,
    RemoteUser,
    useIsConnected,
    useJoin,
    useLocalMicrophoneTrack,
    useLocalCameraTrack,
    usePublish,
    useRemoteUsers,
    useRTCClient,
} from "agora-rtc-react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send, Maximize2, Minimize2, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc, getDocs, setDoc, doc } from "firebase/firestore";
import { useWallet } from "@/context/WalletContext";

interface CoinData {
    id: string | number;
    name: string;
    symbol: string;
    image: string;
}

interface LiveStreamProps {
    appId: string;
    token: string | null;
    channelName: string;
    role: "host" | "audience";
    coinData: CoinData | null;
    isMinimized?: boolean;
    onEndCall?: () => void;
    onToggleMinimize?: () => void;
    fullScreen?: boolean;
}

const LiveStreamContent = ({ appId, token, channelName, role, coinData, isMinimized = false, onEndCall, onToggleMinimize, fullScreen = false }: LiveStreamProps) => {
    const { walletAddress } = useWallet();
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);

    const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn && role === "host");
    const { localCameraTrack } = useLocalCameraTrack(cameraOn && role === "host");
    const remoteUsers = useRemoteUsers();
    const isConnected = useIsConnected();
    const client = useRTCClient();

    useEffect(() => {
        if (client) {
            client.setClientRole(role);
        }
    }, [client, role]);

    useJoin({
        appid: appId,
        channel: channelName,
        token: token,
        uid: null,
    });

    usePublish([localMicrophoneTrack, localCameraTrack]);

    // Active Stream Registration (Host Only)
    useEffect(() => {
        if (role !== "host" || !channelName || !coinData) return;

        const registerStream = async () => {
            if (!walletAddress) return;

            try {
                // Use setDoc with channelName as ID to prevent duplicates
                await setDoc(doc(db, "active_streams", channelName), {
                    channel: channelName,
                    hostAddress: walletAddress,
                    coinId: coinData.id,
                    coinName: coinData.name,
                    coinSymbol: coinData.symbol,
                    coinImage: coinData.image,
                    startedAt: serverTimestamp(),
                    viewerCount: 0,
                });
            } catch (error) {
                console.error("Error registering stream:", error);
            }
        };

        registerStream();

        return () => {
            const cleanupStream = async () => {
                try {
                    await deleteDoc(doc(db, "active_streams", channelName));
                } catch (error) {
                    console.error("Error cleaning up stream:", error);
                }
            };
            cleanupStream();
        };
    }, [channelName, role, coinData, walletAddress]);

    // Minimized View
    if (isMinimized) {
        return (
            <div className="relative w-full h-full bg-black group">
                {role === "host" ? (
                    <LocalUser
                        audioTrack={localMicrophoneTrack}
                        cameraOn={cameraOn}
                        micOn={micOn}
                        videoTrack={localCameraTrack}
                        cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    remoteUsers.length > 0 ? (
                        <RemoteUser user={remoteUsers[0]} className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-white text-xs">Waiting...</div>
                    )
                )}

                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    {onToggleMinimize && (
                        <button onClick={onToggleMinimize} className="p-1 bg-black/50 rounded text-white hover:bg-black/70">
                            <Maximize2 size={14} />
                        </button>
                    )}
                    {onEndCall && (
                        <button onClick={onEndCall} className="p-1 bg-red-600/80 rounded text-white hover:bg-red-700">
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Full View
    return (
        <div className={`flex flex-col h-full bg-black ${fullScreen ? '' : 'rounded-xl overflow-hidden'}`}>
            {/* Header - Only show if NOT fullScreen or if we want a header in fullScreen too */}
            {!fullScreen && (
                <div className="flex items-center justify-between p-4 bg-[#141519] border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden">
                            <img src={coinData?.image} alt={coinData?.symbol} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">{coinData?.name} Live</h3>
                            <span className="text-xs text-green-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Live
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {onToggleMinimize && (
                            <button onClick={onToggleMinimize} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                                <Minimize2 size={20} />
                            </button>
                        )}
                        {onEndCall && (
                            <button onClick={onEndCall} className="p-2 hover:bg-red-900/20 rounded-lg text-red-500 hover:text-red-400 transition-colors">
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Video Area */}
            <div className="flex-1 relative bg-gray-900 min-h-[300px]">
                <div className="absolute inset-0 grid grid-cols-1 gap-2 p-2">
                    {/* Local User (Broadcaster) */}
                    {role === "host" && (
                        <div className="relative rounded-lg overflow-hidden border border-gray-800 bg-black h-full">
                            <LocalUser
                                audioTrack={localMicrophoneTrack}
                                cameraOn={cameraOn}
                                micOn={micOn}
                                videoTrack={localCameraTrack}
                                cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg"
                            >
                                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                                    You (Host)
                                </div>
                            </LocalUser>
                        </div>
                    )}

                    {/* Remote Users */}
                    {remoteUsers.map((user) => (
                        <div key={user.uid} className="relative rounded-lg overflow-hidden border border-gray-800 bg-black h-full">
                            <RemoteUser user={user} />
                            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                                Host
                            </div>
                        </div>
                    ))}

                    {role === "audience" && remoteUsers.length === 0 && (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Waiting for host to join...
                        </div>
                    )}
                </div>

                {/* Controls (Host Only) */}
                {role === "host" && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur px-6 py-3 rounded-full border border-white/10 z-10">
                        <button
                            onClick={() => setMicOn(!micOn)}
                            className={`p-3 rounded-full transition-colors ${micOn ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
                        >
                            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
                        </button>
                        <button
                            onClick={() => setCameraOn(!cameraOn)}
                            className={`p-3 rounded-full transition-colors ${cameraOn ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
                        >
                            {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const LiveStream = (props: LiveStreamProps) => {
    const client = useMemo(() => AgoraRTC.createClient({ mode: "live", codec: "vp8" }), []);

    return (
        <AgoraRTCProvider client={client as any}>
            <LiveStreamContent {...props} />
        </AgoraRTCProvider>
    );
};
