"use client";

import { useState, useEffect, useMemo } from "react";
import AgoraRTC, { IAgoraRTCClient } from "agora-rtc-sdk-ng";
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
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useWallet } from "@/context/WalletContext";

interface LiveStreamProps {
  appId: string;
  token: string | null;
  channelName: string;
  onEndCall: () => void;
}

const LiveStreamContent = ({
  appId,
  token,
  channelName,
  onEndCall,
}: LiveStreamProps) => {
  const { walletAddress } = useWallet();
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);
  const remoteUsers = useRemoteUsers();
  const isConnected = useIsConnected();

  useJoin({
    appid: appId,
    channel: channelName,
    token: token,
  });

  usePublish([localMicrophoneTrack, localCameraTrack]);

  // Chat Logic
  useEffect(() => {
    if (!channelName) return;

    const q = query(
      collection(db, "stream_chats"),
      where("channel", "==", channelName),
      orderBy("timestamp", "asc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [channelName]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !walletAddress) return;

    try {
      await addDoc(collection(db, "stream_chats"), {
        channel: channelName,
        text: newMessage,
        sender: walletAddress,
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black rounded-xl overflow-hidden">
      {/* Video Area */}
      <div className="flex-1 relative bg-gray-900 min-h-[400px]">
        <div className="absolute inset-0 grid grid-cols-1 gap-2 p-2">
          {/* Local User (Broadcaster) */}
          <div className="relative rounded-lg overflow-hidden border border-gray-800 bg-black">
            <LocalUser
              audioTrack={localMicrophoneTrack}
              cameraOn={cameraOn}
              micOn={micOn}
              videoTrack={localCameraTrack}
              cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg"
            >
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                You (Broadcaster)
              </div>
            </LocalUser>
          </div>

          {/* Remote Users (if any join as hosts) */}
          {remoteUsers.map((user) => (
            <div
              key={user.uid}
              className="relative rounded-lg overflow-hidden border border-gray-800 bg-black"
            >
              <RemoteUser user={user} />
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                User {user.uid}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
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
          <button
            onClick={onEndCall}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <PhoneOff size={20} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="h-[200px] bg-[#141519] border-t border-gray-800 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className="text-sm">
              <span className="font-bold text-green-400 text-xs">
                {msg.sender.slice(0, 4)}...{msg.sender.slice(-4)}:
              </span>
              <span className="text-gray-300 ml-2">{msg.text}</span>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center text-gray-500 text-sm mt-4">
              Start the conversation!
            </div>
          )}
        </div>
        <form
          onSubmit={sendMessage}
          className="p-3 border-t border-gray-800 flex gap-2"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Say something..."
            className="flex-1 bg-[#1a1b1f] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export const LiveStream = (props: LiveStreamProps) => {
  const client = useMemo(
    () => AgoraRTC.createClient({ mode: "live", codec: "vp8" }),
    [],
  );

  return (
    <AgoraRTCProvider client={client as any}>
      <LiveStreamContent {...props} />
    </AgoraRTCProvider>
  );
};
