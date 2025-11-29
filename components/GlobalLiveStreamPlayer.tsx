"use client";

import React from "react";
import Draggable from "react-draggable";
import dynamic from "next/dynamic";
import { useLiveStream } from "@/context/LiveStreamContext";

const LiveStream = dynamic(() => import("./LiveStream").then(mod => mod.LiveStream), { ssr: false });

export const GlobalLiveStreamPlayer = () => {
    const { isLive, isMinimized, channelName, role, coinData, leaveStream, minimize, maximize } = useLiveStream();
    const agoraAppId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const agoraToken = process.env.NEXT_PUBLIC_AGORA_TOKEN;
    const nodeRef = React.useRef(null);

    React.useEffect(() => {
        console.log("Agora Config:", {
            appId: agoraAppId ? "Present" : "Missing",
            token: agoraToken ? "Present" : "Missing",
            channel: channelName
        });
    }, [agoraAppId, agoraToken, channelName]);

    if (!isLive || !channelName || !agoraAppId) return null;

    // If minimized, render draggable window
    if (isMinimized) {
        return (
            <Draggable nodeRef={nodeRef} defaultPosition={{ x: 0, y: 0 }} bounds="parent">
                <div ref={nodeRef} className="fixed bottom-4 right-4 z-[9999] w-64 h-48 shadow-2xl rounded-xl overflow-hidden border border-gray-700 cursor-move">
                    <LiveStream
                        appId={agoraAppId}
                        token={agoraToken || null}
                        channelName={channelName}
                        role={role}
                        coinData={coinData}
                        isMinimized={true}
                        onEndCall={leaveStream}
                        onToggleMinimize={maximize}
                    />
                </div>
            </Draggable>
        );
    }

    // If maximized, render full screen modal overlay
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl h-[80vh] bg-[#141519] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                <LiveStream
                    appId={agoraAppId}
                    token={agoraToken || null}
                    channelName={channelName}
                    role={role}
                    coinData={coinData}
                    isMinimized={false}
                    onEndCall={leaveStream}
                    onToggleMinimize={minimize}
                />
            </div>
        </div>
    );
};
