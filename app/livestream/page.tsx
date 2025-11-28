import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import LivestreamPage from "@/components/LivestreamPage";

export default function Livestream() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar />
      <div className="flex flex-col min-h-screen md:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-in-out">
        <Navbar />
        <div className="flex-1 overflow-y-auto">
          <LivestreamPage />
        </div>
      </div>
    </main>
  );
}
