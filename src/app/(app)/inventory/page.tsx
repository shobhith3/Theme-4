import { PageContainer } from "@/components/common/page-container";
import InventoryContent from "@/components/inventory/inventory-content";
import { getOrganizationBranches, getBranchInventory } from "@/app/actions/inventory-actions";
import { Suspense } from "react";

export default async function InventoryPage() {
  const branches = await getOrganizationBranches();
  
  // Initially we can fetch all or leave it to client to fetch.
  // We'll fetch all branches' inventory. For large datasets this isn't ideal but fine for our scale.
  let allInventory: any[] = [];
  for (const b of branches) {
    const branchInv = await getBranchInventory(b.id);
    allInventory = allInventory.concat(branchInv);
  }

  return (
    <PageContainer>
      <Suspense fallback={<div className="p-8 text-center text-text-muted">Loading inventory data...</div>}>
        <InventoryContent initialBranches={branches} initialInventory={allInventory} />
      </Suspense>
    </PageContainer>
  );
}
