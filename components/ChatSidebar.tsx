"use client";

import { useState } from "react";
import { Search, Circle } from "lucide-react";

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline" | "away";
  lastMessage?: string;
  time?: string;
  unreadCount?: number;
}

const MOCK_FRIENDS: Friend[] = [
  {
    id: "1",
    name: "Dhruv Pal",
    avatar: "/image.png", // Placeholder
    status: "online",
    lastMessage: "Did you see the new token launch?",
    time: "10:30 AM",
    unreadCount: 2,
  },
  {
    id: "2",
    name: "Satyam Yadav",
    avatar: "/image.png",
    status: "offline",
    lastMessage: "Thanks for the tip!",
    time: "Yesterday",
  },
  {
    id: "3",
    name: "Rishabh Kukdeja",
    avatar: "/image.png",
    status: "away",
    lastMessage: "HODL!",
    time: "2 days ago",
  },
];

interface ChatSidebarProps {
  onSelectFriend: (friend: Friend) => void;
  selectedFriendId?: string;
}

export default function ChatSidebar({ onSelectFriend, selectedFriendId }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFriends = MOCK_FRIENDS.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full md:w-80 border-r border-[var(--border-color)] bg-[var(--card-bg)] flex flex-col h-full">
      <div className="p-4 border-b border-[var(--border-color)]">
        <h2 className="text-xl font-bold mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--input-bg)] text-[var(--foreground)] pl-10 pr-4 py-2 rounded-lg border border-[var(--border-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] placeholder-[var(--muted-foreground)]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredFriends.map((friend) => (
          <div
            key={friend.id}
            onClick={() => onSelectFriend(friend)}
            className={`p-4 flex items-center gap-3 cursor-pointer transition-colors hover:bg-[var(--secondary)]/50 ${selectedFriendId === friend.id ? "bg-[var(--secondary)]/50 border-l-2 border-[var(--primary)]" : ""
              }`}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden">
                {/* Replace with actual Image component if available or standard img */}
                <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--card-bg)] ${friend.status === "online" ? "bg-green-500" : friend.status === "away" ? "bg-yellow-500" : "bg-gray-500"
                }`}></div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-semibold truncate text-[var(--foreground)]">{friend.name}</h3>
                <span className="text-xs text-[var(--muted-foreground)]">{friend.time}</span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] truncate">
                {friend.lastMessage}
              </p>
            </div>

            {friend.unreadCount && friend.unreadCount > 0 && (
              <div className="min-w-[20px] h-5 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center px-1.5">
                {friend.unreadCount}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
