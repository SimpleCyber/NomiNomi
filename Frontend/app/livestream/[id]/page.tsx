"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { LiveStream } from "@/components/LiveStream";
import StreamChat from "@/components/StreamChat";
import TradePanel from "@/components/TradePanel";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Loader2, ArrowLeft } from "lucide-react";

export default function SingleStreamPage() {
  const params = useParams();
  const router = useRouter();
  const channelId = params.id as string;
  const [streamData, setStreamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const q = query(collection(db, "active_streams"), where("channel", "==", channelId));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          setStreamData(snapshot.docs[0].data());
        } else {
          // Handle stream not found or ended
          console.log("Stream not found");
        }
      } catch (error) {
        console.error("Error fetching stream:", error);
      } finally {
        setLoading(false);
      }
    };

    if (channelId) {
      fetchStream();
    }
  }, [channelId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Loader2 className="animate-spin w-10 h-10 text-green-500" />
      </div>
    );
  }

  if (!streamData) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
        <h1 className="text-2xl font-bold">Stream Offline or Not Found</h1>
        <button onClick={() => router.push("/livestream")} className="text-green-500 hover:underline">
          Back to Livestreams
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-[var(--sidebar-width)] h-screen overflow-hidden">
        <Navbar />

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Column: Video Player (70%) */}
          <div className="flex-1 bg-black relative flex flex-col">
            <div className="absolute top-4 left-4 z-10">
              <button
                onClick={() => router.push("/livestream")}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            </div>

            <div className="flex-1">
              <LiveStream
                appId={process.env.NEXT_PUBLIC_AGORA_APP_ID || ""}
                token={null} // In production, fetch token from server
                channelName={channelId}
                role="audience" // Default to audience for viewers
                coinData={{
                  id: streamData.coinId,
                  name: streamData.coinName,
                  symbol: streamData.coinSymbol,
                  image: streamData.coinImage
                }}
                fullScreen={true}
              />
            </div>
          </div>

          {/* Right Column: Chat & Trade (30%) */}
          <div className="w-full lg:w-[400px] bg-[#0f1012] border-l border-gray-800 flex flex-col h-[50vh] lg:h-full">
            {/* Top: Chat */}
            <div className="flex-1 min-h-0 border-b border-gray-800">
              <StreamChat channelName={channelId} />
            </div>

            {/* Bottom: Trade */}
            <div className="h-[350px] min-h-[350px]">
              <TradePanel
                coinSymbol={streamData.coinSymbol}
                coinName={streamData.coinName}
                coinImage={streamData.coinImage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
