"use client";

import { useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";

export default function ChatInterface() {
    const [selectedFriend, setSelectedFriend] = useState<any>(null); // Using any for simplicity with the mock types, ideally import shared types

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-[var(--background)]">
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
