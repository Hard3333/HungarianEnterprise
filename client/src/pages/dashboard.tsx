import { StatsCards } from "@/components/dashboard/stats-cards";
import { Charts } from "@/components/dashboard/charts";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Irányítópult</h1>
            <p className="text-muted-foreground">
              Üdvözöljük az ERP rendszerben
            </p>
          </div>

          <StatsCards />
          <Charts />
        </main>
      </div>
    </div>
  );
}