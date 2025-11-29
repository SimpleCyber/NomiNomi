"use client";

import { use } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import ProfileView from "@/components/ProfileView";

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  // Decode the ID if it was encoded (though usually wallet addresses are safe in URL)
  const walletAddress = decodeURIComponent(id);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans">
      <Sidebar />
      <div className="flex flex-col min-h-screen md:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-in-out">
        <Navbar />
        <div className="flex-1 overflow-y-auto">
          <ProfileView walletAddress={walletAddress} isOwner={false} />
        </div>
      </div>
    </main>
  );
}
