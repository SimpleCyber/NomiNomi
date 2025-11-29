/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { UserProfile } from "@/lib/user";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { subscribeToChats } from "@/lib/chat";
import { toast } from "sonner";

// Simple debounce hook implementation if not exists
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline" | "away";
  lastMessage?: string;
  time?: string;
  unreadCount?: number;
}


interface ChatSidebarProps {
  onSelectFriend: (friend: Friend) => void;
  selectedFriendId?: string;
}

export default function ChatSidebar({ onSelectFriend, selectedFriendId }: ChatSidebarProps) {
  const router = useRouter();
  const { walletAddress: currentUserAddress } = useWallet();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChats, setActiveChats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Refs for tracking message timestamps to trigger notifications
  const lastMessageTimestamps = useRef<Map<string, number>>(new Map());
  const isFirstLoad = useRef(true);

  // Subscribe to active chats
  useEffect(() => {
    if (!currentUserAddress) {
      setActiveChats([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToChats(currentUserAddress, async (chats) => {
      // For each chat, we need to find the "other" participant to display their name/avatar
      const formattedChats = await Promise.all(chats.map(async (chat) => {
        const otherUserId = chat.participants.find(p => p !== currentUserAddress);
        if (!otherUserId) return null;

        // Fetch user profile for the other participant
        // In a real app, we might want to cache this or use a listener if profiles change often
        const { getUserProfile } = await import("@/lib/user");
        const userProfile = await getUserProfile(otherUserId);

        const friendName = userProfile?.username || "Unknown User";

        // Notification Logic
        if (chat.lastMessage) {
          const currentTimestamp = chat.lastMessage.timestamp?.toMillis
            ? chat.lastMessage.timestamp.toMillis()
            : new Date(chat.lastMessage.timestamp).getTime();

          const lastTimestamp = lastMessageTimestamps.current.get(chat.id);

          // If not first load, and we have a new message, and it's not from us
          if (!isFirstLoad.current && lastTimestamp && currentTimestamp > lastTimestamp) {
            if (chat.lastMessage.senderId !== currentUserAddress) {
              toast.info(`New message from ${friendName}`, {
                description: chat.lastMessage.text,
              });
            }
          }

          // Update timestamp
          lastMessageTimestamps.current.set(chat.id, currentTimestamp);
        }

        return {
          id: otherUserId, // We use the user ID as the friend ID for selection
          chatId: chat.id,
          name: friendName,
          avatar: "/image.png", // Placeholder
          status: "offline", // We don't have real presence yet
          lastMessage: chat.lastMessage?.text || "",
          time: chat.updatedAt ? new Date(chat.updatedAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
          unreadCount: 0 // TODO: Implement unread counts
        };
      }));

      // After first pass, disable first load flag
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
      }

      setActiveChats(formattedChats.filter(c => c !== null));
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserAddress]);

  // Filter active chats based on search query
  const filteredActiveChats = activeChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full md:w-80 border-r border-[var(--border-color)] bg-[var(--card-bg)] flex flex-col h-full">
      <div className="p-4 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--input-bg)] text-[var(--foreground)] pl-10 pr-4 py-2 rounded-lg border border-[var(--border-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] placeholder-[var(--muted-foreground)]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Loading State */}
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-700"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Active Chats List */}
            {filteredActiveChats.length > 0 ? (
              <>
                <h3 className="px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                  Recent Chats
                </h3>
                {filteredActiveChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => onSelectFriend(chat)}
                    className={`p-4 flex items-center gap-3 cursor-pointer transition-colors hover:bg-[var(--secondary)]/50 ${selectedFriendId === chat.id ? "bg-[var(--secondary)]/50 border-l-2 border-[var(--primary)]" : ""
                      }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden">
                        <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--card-bg)] ${chat.status === "online" ? "bg-green-500" : chat.status === "away" ? "bg-yellow-500" : "bg-gray-500"
                        }`}></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold truncate text-[var(--foreground)]">{chat.name}</h3>
                        <span className="text-xs text-[var(--muted-foreground)]">{chat.time}</span>
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)] truncate">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[var(--muted-foreground)] p-4 text-center">
                {searchQuery ? (
                  <p>No chats found matching "{searchQuery}"</p>
                ) : (
                  <>
                    <p className="mb-2">No active chats yet.</p>
                    <p className="text-sm">Search for users in the top bar to start a chat.</p>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
