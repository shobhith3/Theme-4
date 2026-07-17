import { PageContainer } from "@/components/common/page-container";
import InventoryContent from "@/components/inventory/inventory-content";
import { getOrganizationBranches, getBranchInventory } from "@/app/actions/inventory-actions";
import { Suspense } from "react";

export default async function InventoryPage() {
  const branches = await getOrganizationBranches();
  
  // Fetch all branches' inventory in a single query.
  const allInventory = await getBranchInventory();

  return (
    <PageContainer>
      <Suspense fallback={<div className="p-8 text-center text-text-muted">Loading inventory data...</div>}>
        <InventoryContent initialBranches={branches} initialInventory={allInventory} />
      </Suspense>
    </PageContainer>
  );
}
