"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { StockIntakeCenter } from "@/components/inventory/stock-intake-center";

export default function StockIntakePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Stock Intake & Adjustment"
        description="Receive stock, log wastage, import bulk data, or process supplier invoices."
      />
      
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <StockIntakeCenter isOpen={true} inline={true} onClose={() => {
          // When used as a page, we just redirect back to inventory if they close it.
          window.location.href = "/inventory";
        }} />
      </div>
    </PageContainer>
  );
}
