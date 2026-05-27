import { Sidebar } from "@/components/sidebar";
import { DemoBanner } from "@/components/demo/demo-banner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-background pb-20">
        {children}
      </main>
      <DemoBanner />
    </div>
  );
}
