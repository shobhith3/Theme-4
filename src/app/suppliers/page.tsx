"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { DataTable } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { ConfidenceBadge } from "@/components/common/confidence-badge";
import { mockSuppliers } from "@/lib/mock-data";

export default function SuppliersPage() {
  const columns = [
    { header: "Supplier", accessorKey: "name" as const },
    { header: "Categories", accessorKey: "categories" as const },
    { header: "Price Index", accessorKey: "priceIndex" as const, align: "right" as const },
    { header: "On-Time", accessorKey: "onTime" as const, align: "right" as const },
    { header: "Quality", accessorKey: "quality" as const, align: "right" as const },
    { header: "Lead Time", accessorKey: "leadTime" as const, align: "right" as const },
    { header: "Fulfillment", accessorKey: "fulfillment" as const, align: "right" as const },
    { 
      header: "AI Score", 
      cell: (item: typeof mockSuppliers[0]) => <ConfidenceBadge score={parseInt(item.aiScore)} /> 
    },
    { 
      header: "Risk", 
      cell: (item: typeof mockSuppliers[0]) => <StatusBadge status={item.risk} /> 
    }
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Supplier Intelligence" 
        description="Compare pricing, delivery reliability, quality, lead-time stability, and procurement exposure." 
      />

      {/* Top Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="flex flex-col bg-white border border-border rounded-xl p-4">
          <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-1">Active Suppliers</span>
          <span className="text-[24px] font-bold text-text-primary tabular-nums">24</span>
        </div>
        <div className="flex flex-col bg-white border border-border rounded-xl p-4">
          <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-1">Avg On-Time Rate</span>
          <span className="text-[24px] font-bold text-text-primary tabular-nums">91.4%</span>
        </div>
        <div className="flex flex-col bg-white border border-border rounded-xl p-4">
          <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-1">At-Risk Suppliers</span>
          <span className="text-[24px] font-bold text-critical tabular-nums">3</span>
        </div>
        <div className="flex flex-col bg-white border border-border rounded-xl p-4">
          <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-1">Potential Savings</span>
          <span className="text-[24px] font-bold text-[var(--color-intelligence)] tabular-nums">₹11.8K</span>
        </div>
      </div>

      <DataTable data={mockSuppliers} columns={columns} onRowClick={(item) => console.log(item)} />
    </PageContainer>
  );
}
