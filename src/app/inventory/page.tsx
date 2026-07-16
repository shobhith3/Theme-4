"use client";

import { PageContainer } from "@/components/common/page-container";
import dynamic from "next/dynamic";

const InventoryContent = dynamic(() => import("@/components/inventory/inventory-content"), { ssr: false });

export default function InventoryPage() {
  return (
    <PageContainer>
      <InventoryContent />
    </PageContainer>
  );
}
