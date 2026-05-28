import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Hero from "@/components/Hero";
import MarketStats from "@/components/MarketStats";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar />
      <div className="flex flex-col min-h-screen md:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-in-out">
        <Navbar />
        <div className="flex-1 overflow-y-auto">
          <Hero />
          <MarketStats />
          <MarketTicker />
          <Footer />
        </div>
      </div>
    </main>
  );
}
