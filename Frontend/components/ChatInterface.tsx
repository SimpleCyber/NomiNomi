"use client";

import { useState, useEffect } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";

interface ChatInterfaceProps {
    initialChatUserId?: string | null;
}

export default function ChatInterface({ initialChatUserId }: ChatInterfaceProps) {
    const [selectedFriend, setSelectedFriend] = useState<any>(null); // Using any for simplicity with the mock types, ideally import shared types
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true);

    useEffect(() => {
        if (initialChatUserId) {
            // Fetch user details if provided
            const fetchUser = async () => {
                const { getUserProfile } = await import("@/lib/user");
                const user = await getUserProfile(initialChatUserId);
                if (user) {
                    setSelectedFriend({
                        id: user.walletAddress,
                        name: user.username,
                        avatar: "/image.png", // Placeholder
                        status: "offline", // Default
                    });
                    setIsMobileSidebarOpen(false);
                }
            };
            fetchUser();
        }
    }, [initialChatUserId]);

    return (
        <div className="flex h-full overflow-hidden bg-[var(--background)]">
            <div className={`${selectedFriend ? 'hidden md:block' : 'w-full'} md:w-auto h-full`}>
                <ChatSidebar
                    onSelectFriend={setSelectedFriend}
                    selectedFriendId={selectedFriend?.id}
                />
            </div>

            <div className={`${!selectedFriend ? 'hidden md:flex' : 'flex'} flex-1 h-full`}>
                <ChatWindow friend={selectedFriend} />
            </div>
        </div>
    );
}
