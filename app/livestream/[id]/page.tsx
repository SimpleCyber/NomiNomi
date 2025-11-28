import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import LivestreamViewPage from "@/components/LivestreamViewPage";

export default async function LivestreamView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar />
      <div className="flex flex-col min-h-screen md:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-in-out">
        <Navbar />
        <div className="flex-1 overflow-y-auto">
          <LivestreamViewPage streamId={id} />
        </div>
      </div>
    </main>
  );
}
