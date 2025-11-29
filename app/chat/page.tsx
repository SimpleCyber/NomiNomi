import ChatInterface from "@/components/ChatInterface";
import Sidebar from "@/components/Sidebar";

export default function ChatPage() {
    return (
        <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            <Sidebar />
            <div className="flex flex-col h-screen md:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-in-out">
                <ChatInterface />
            </div>
        </main>
    );
}
