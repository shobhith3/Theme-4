import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import ForecastingContent from "@/components/forecasting/forecasting-content";
import { getIntelligenceMetrics } from "@/app/actions/intelligence-actions";
import { getBranchInventory, getOrganizationBranches } from "@/app/actions/inventory-actions";
import { getPendingDecisions } from "@/app/actions/engine-actions";

export default async function ForecastingPage() {
  const [metrics, inventory, branches, decisions] = await Promise.all([
    getIntelligenceMetrics(),
    getBranchInventory(),
    getOrganizationBranches(),
    getPendingDecisions()
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Intelligence & Forecasting"
        description="Monitor AI decision accuracy, ROI, and run scenario simulations for inventory risk."
      />
      <ForecastingContent
        metrics={metrics}
        inventory={inventory}
        branches={branches}
        decisions={decisions}
      />
    </PageContainer>
  );
}
