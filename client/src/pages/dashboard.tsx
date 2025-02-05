import { StatsCards } from "@/components/dashboard/stats-cards";
import { Charts } from "@/components/dashboard/charts";
import { PageLayout } from "@/components/layout/page-layout";
import { AnimatedItem } from "@/components/layout/animated-content";

export default function Dashboard() {
  return (
    <PageLayout
      title="Irányítópult"
      description="Üdvözöljük az ERP rendszerben"
    >
      <AnimatedItem>
        <StatsCards />
      </AnimatedItem>

      <AnimatedItem>
        <Charts />
      </AnimatedItem>
    </PageLayout>
  );
}