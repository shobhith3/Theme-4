"use client";

import { PageContainer } from "@/components/common/page-container";
import InventoryContent from "@/components/inventory/inventory-content";
import { Suspense } from "react";

export default function InventoryPage() {
  return (
    <PageContainer>
      <Suspense fallback={<div className="p-8 text-center text-text-muted">Loading inventory data...</div>}>
        <InventoryContent />
      </Suspense>
    </PageContainer>
  );
}
