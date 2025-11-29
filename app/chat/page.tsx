"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ChatInterface from "@/components/ChatInterface";
import Sidebar from "@/components/Sidebar";

function ChatContent() {
  const searchParams = useSearchParams();
  const chatWith = searchParams.get("chatWith");

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans flex">
      <Sidebar />
      <div className="flex-1 md:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-in-out h-screen overflow-hidden">
        <ChatInterface initialChatUserId={chatWith} />
      </div>
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans flex">
          <Sidebar />
          <div className="flex-1 md:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-in-out h-screen overflow-hidden flex items-center justify-center">
            <div className="text-center">Loading...</div>
          </div>
        </main>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
