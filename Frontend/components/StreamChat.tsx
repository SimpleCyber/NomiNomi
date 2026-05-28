"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useWallet } from "@/context/WalletContext";

interface StreamChatProps {
    channelName: string;
}

export default function StreamChat({ channelName }: StreamChatProps) {
    const { walletAddress } = useWallet();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!channelName) return;

        const q = query(
            collection(db, "stream_chats"),
            where("channel", "==", channelName),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
            scrollToBottom();
        });

        return () => unsubscribe();
    }, [channelName]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

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
        <div className="flex flex-col h-full bg-[#141519] border border-gray-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-gray-800 bg-[#1a1b1f]">
                <h3 className="font-bold text-gray-200 text-sm">Live Chat</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center text-gray-600 text-xs mt-10">
                        Welcome to the chat! Say hello. 👋
                    </div>
                )}
                {messages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-2 text-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                            <User size={12} className="text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                                <span className="font-bold text-gray-400 text-xs truncate max-w-[100px]">
                                    {msg.sender.slice(0, 6)}...{msg.sender.slice(-4)}
                                </span>
                                <span className="text-gray-500 text-[10px]">
                                    {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-gray-200 break-words leading-relaxed">{msg.text}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3 bg-[#1a1b1f] border-t border-gray-800 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Send a message..."
                    className="flex-1 bg-[#0f1012] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition-colors placeholder:text-gray-600"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}
