"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, X } from "lucide-react";
import { searchUsers, UserProfile } from "@/lib/user";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { subscribeToChats } from "@/lib/chat";

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

export default function ChatSidebar({
  onSelectFriend,
  selectedFriendId,
}: ChatSidebarProps) {
  const router = useRouter();
  const { walletAddress: currentUserAddress } = useWallet();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeChats, setActiveChats] = useState<any[]>([]);
  const [isAddingFriend, setIsAddingFriend] = useState(false); // Toggle for global search

  const debouncedSearchQuery = useDebounceValue(searchQuery, 500);

  // Subscribe to active chats
  useEffect(() => {
    if (!currentUserAddress) {
      setActiveChats([]);
      return;
    }

    const unsubscribe = subscribeToChats(currentUserAddress, async (chats) => {
      // For each chat, we need to find the "other" participant to display their name/avatar
      const formattedChats = await Promise.all(
        chats.map(async (chat) => {
          const otherUserId = chat.participants.find(
            (p) => p !== currentUserAddress,
          );
          if (!otherUserId) return null;

          // Fetch user profile for the other participant
          // In a real app, we might want to cache this or use a listener if profiles change often
          const { getUserProfile } = await import("@/lib/user");
          const userProfile = await getUserProfile(otherUserId);

          return {
            id: otherUserId, // We use the user ID as the friend ID for selection
            chatId: chat.id,
            name: userProfile?.username || "Unknown User",
            avatar: "/image.png", // Placeholder
            status: "offline", // We don't have real presence yet
            lastMessage: chat.lastMessage?.text || "",
            time: chat.updatedAt
              ? new Date(chat.updatedAt.toDate()).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            unreadCount: 0, // TODO: Implement unread counts
          };
        }),
      );

      setActiveChats(formattedChats.filter((c) => c !== null));
    });

    return () => unsubscribe();
  }, [currentUserAddress]);

  // Handle global search (only when adding friend)
  useEffect(() => {
    const performSearch = async () => {
      if (isAddingFriend && debouncedSearchQuery.trim().length > 0) {
        setIsSearching(true);
        const results = await searchUsers(debouncedSearchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    };

    performSearch();
  }, [debouncedSearchQuery, isAddingFriend]);

  const handleUserClick = (user: UserProfile) => {
    // Navigate to user profile
    router.push(`/profile/${user.walletAddress}`);
  };

  const toggleAddFriend = () => {
    setIsAddingFriend(!isAddingFriend);
    setSearchQuery(""); // Clear search when toggling
    setSearchResults([]);
  };

  // Filter active chats based on search query (when NOT adding friend)
  const filteredActiveChats = !isAddingFriend
    ? activeChats.filter((chat) =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : activeChats;

  return (
    <div className="w-full md:w-80 border-r border-[var(--border-color)] bg-[var(--card-bg)] flex flex-col h-full">
      <div className="p-4 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {isAddingFriend ? "Add Friend" : "Messages"}
          </h2>
          <button
            onClick={toggleAddFriend}
            className="p-2 hover:bg-[var(--secondary)] rounded-full transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            title={isAddingFriend ? "Close Search" : "Add New Friend"}
          >
            {isAddingFriend ? <X size={20} /> : <UserPlus size={20} />}
          </button>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            size={18}
          />
          <input
            type="text"
            placeholder={
              isAddingFriend ? "Search new users..." : "Search chats..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--input-bg)] text-[var(--foreground)] pl-10 pr-4 py-2 rounded-lg border border-[var(--border-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] placeholder-[var(--muted-foreground)]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Global Search Results (Add Friend Mode) */}
        {isAddingFriend && (
          <div className="mb-4">
            <h3 className="px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              {isSearching ? "Searching..." : "Global Results"}
            </h3>
            {searchResults.length > 0
              ? searchResults.map((user) => (
                  <div
                    key={user.walletAddress}
                    onClick={() => handleUserClick(user)}
                    className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-[var(--secondary)]/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg">
                      🐸
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[var(--foreground)] truncate">
                        {user.username}
                      </h4>
                      <p className="text-xs text-[var(--muted-foreground)] truncate">
                        {user.walletAddress.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                ))
              : searchQuery.trim().length > 0 &&
                !isSearching && (
                  <div className="px-4 py-2 text-sm text-[var(--muted-foreground)]">
                    No users found.
                  </div>
                )}
          </div>
        )}

        {/* Active Chats List (Default Mode) */}
        {!isAddingFriend && (
          <>
            {filteredActiveChats.length > 0 ? (
              <>
                <h3 className="px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                  Recent Chats
                </h3>
                {filteredActiveChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => onSelectFriend(chat)}
                    className={`p-4 flex items-center gap-3 cursor-pointer transition-colors hover:bg-[var(--secondary)]/50 ${
                      selectedFriendId === chat.id
                        ? "bg-[var(--secondary)]/50 border-l-2 border-[var(--primary)]"
                        : ""
                    }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden">
                        <img
                          src={chat.avatar}
                          alt={chat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--card-bg)] ${
                          chat.status === "online"
                            ? "bg-green-500"
                            : chat.status === "away"
                              ? "bg-yellow-500"
                              : "bg-gray-500"
                        }`}
                      ></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold truncate text-[var(--foreground)]">
                          {chat.name}
                        </h3>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {chat.time}
                        </span>
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
                    <button
                      onClick={toggleAddFriend}
                      className="text-[var(--primary)] hover:underline text-sm"
                    >
                      Find someone to chat with
                    </button>
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
