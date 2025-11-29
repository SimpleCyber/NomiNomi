"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MoreVertical, Phone, Video } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import {
  getChatId,
  sendMessage,
  subscribeToMessages,
  Message,
} from "@/lib/chat";

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline" | "away";
}

interface ChatWindowProps {
  friend: Friend | null;
}

export default function ChatWindow({ friend }: ChatWindowProps) {
  const { walletAddress: currentUserAddress } = useWallet();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!friend || !currentUserAddress) {
      setMessages([]);
      return;
    }

    const chatId = getChatId(currentUserAddress, friend.id);
    const unsubscribe = subscribeToMessages(chatId, (newMessages) => {
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [friend, currentUserAddress]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !friend || !currentUserAddress) return;

    const chatId = getChatId(currentUserAddress, friend.id);

    try {
      await sendMessage(chatId, currentUserAddress, newMessage, [
        currentUserAddress,
        friend.id,
      ]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!friend) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--background)] text-[var(--muted-foreground)]">
        <p>Select a friend to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--background)]">
      {/* Header */}
      <div className="h-16 px-6 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--card-bg)]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--card-bg)] ${
                friend.status === "online"
                  ? "bg-green-500"
                  : friend.status === "away"
                    ? "bg-yellow-500"
                    : "bg-gray-500"
              }`}
            ></div>
          </div>
          <div>
            <h3 className="font-bold text-[var(--foreground)]">
              {friend.name}
            </h3>
            <span className="text-xs text-[var(--muted-foreground)] capitalize">
              {friend.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[var(--muted-foreground)]">
          <button className="hover:text-[var(--foreground)] transition-colors">
            <Phone size={20} />
          </button>
          <button className="hover:text-[var(--foreground)] transition-colors">
            <Video size={20} />
          </button>
          <button className="hover:text-[var(--foreground)] transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserAddress;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  isMe
                    ? "bg-[var(--primary)] text-white rounded-br-none"
                    : "bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border-color)] rounded-bl-none"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <span
                  className={`text-[10px] mt-1 block ${
                    isMe ? "text-white/70" : "text-[var(--muted-foreground)]"
                  } text-right`}
                >
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-[var(--card-bg)] border-t border-[var(--border-color)]">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-3 bg-[var(--input-bg)] rounded-xl px-4 py-2 border border-[var(--border-color)] focus-within:ring-1 focus-within:ring-[var(--primary)] transition-all"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:outline-none text-[var(--foreground)] placeholder-[var(--muted-foreground)]"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </form>
        {!currentUserAddress && (
          <div className="text-center mt-2">
            <span className="text-xs text-[var(--muted-foreground)]">
              Connect wallet to start chatting
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
