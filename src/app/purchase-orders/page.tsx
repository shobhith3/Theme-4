"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { DataTable } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { mockOrders } from "@/lib/mock-data";

export default function PurchaseOrdersPage() {
  const columns = [
    { header: "PO Number", accessorKey: "id" as const },
    { header: "Supplier", accessorKey: "supplier" as const },
    { header: "Branch", accessorKey: "branch" as const },
    { header: "Items", accessorKey: "items" as const, align: "right" as const },
    { header: "Value", accessorKey: "value" as const, align: "right" as const },
    { header: "Expected Delivery", accessorKey: "delivery" as const },
    { 
      header: "Status", 
      cell: (item: typeof mockOrders[0]) => <StatusBadge status={item.status} /> 
    },
    { header: "Owner", accessorKey: "owner" as const },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Purchase Orders" 
        description="Manage purchase orders from draft through delivery and reconciliation." 
        actions={
          <button className="px-4 py-2 bg-[var(--color-sidebar-bg)] text-white rounded-md text-[13px] font-medium hover:bg-black transition-colors shadow-sm">
            Create Order
          </button>
        }
      />

      <div className="flex items-center gap-6 border-b border-border mb-6">
        <button className="pb-3 text-[14px] font-bold text-text-primary border-b-2 border-[var(--color-intelligence)]">
          All
        </button>
        <button className="pb-3 text-[14px] font-medium text-text-secondary hover:text-text-primary transition-colors border-b-2 border-transparent">
          Draft
        </button>
        <button className="pb-3 text-[14px] font-medium text-text-secondary hover:text-text-primary transition-colors border-b-2 border-transparent">
          Awaiting Approval
        </button>
        <button className="pb-3 text-[14px] font-medium text-text-secondary hover:text-text-primary transition-colors border-b-2 border-transparent">
          Approved
        </button>
        <button className="pb-3 text-[14px] font-medium text-text-secondary hover:text-text-primary transition-colors border-b-2 border-transparent">
          In Transit
        </button>
        <button className="pb-3 text-[14px] font-medium text-text-secondary hover:text-text-primary transition-colors border-b-2 border-transparent">
          Received
        </button>
      </div>

      <DataTable data={mockOrders} columns={columns} onRowClick={(item) => console.log(item)} />
    </PageContainer>
  );
}
