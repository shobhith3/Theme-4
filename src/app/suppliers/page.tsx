"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { DataTable } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { useStore } from "@/store/useStore";
import { Supplier } from "@/types";

export default function SuppliersPage() {
  const suppliers = useStore((s) => s.suppliers);

  const columns = [
    { header: "Supplier", accessorKey: "name" as const },
    { 
      header: "Categories", 
      cell: (item: Supplier) => item.itemCategories.join(", ") 
    },
    { header: "Lead Time", cell: (item: Supplier) => `${item.avgLeadTimeDays} days`, align: "right" as const },
    { header: "On-Time Delivery", cell: (item: Supplier) => `${item.onTimeDeliveryRate}%`, align: "right" as const },
    { header: "Defect Rate", cell: (item: Supplier) => `${item.defectRate}%`, align: "right" as const },
    { header: "Reliability", cell: (item: Supplier) => `${item.reliabilityScore}%`, align: "right" as const },
    {
      header: "Status",
      cell: (item: Supplier) => (
        <StatusBadge status={item.reliabilityScore > 90 ? 'healthy' : item.reliabilityScore > 80 ? 'warning' : 'critical'} />
      )
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Suppliers"
        description="Monitor supplier reliability, lead times, and fulfillment performance."
        actions={
          <button className="px-4 py-2 bg-[var(--color-sidebar-bg)] text-white rounded-md text-[13px] font-medium hover:bg-black transition-colors shadow-sm">
            Add Supplier
          </button>
        }
      />

      <div className="flex items-center gap-3 mb-6">
        <input 
          type="text" 
          placeholder="Search suppliers..." 
          className="h-[36px] px-3 bg-surface border border-border rounded-md text-[13px] min-w-[250px]" 
        />
        <select className="h-[36px] px-3 bg-surface border border-border rounded-md text-[13px]">
          <option>All Categories</option>
          <option>Produce</option>
          <option>Protein</option>
        </select>
        <select className="h-[36px] px-3 bg-surface border border-border rounded-md text-[13px]">
          <option>All Statuses</option>
          <option>Healthy</option>
          <option>Warning</option>
        </select>
        <div className="ml-auto">
          <span className="text-[13px] font-medium text-text-secondary">
            {suppliers.length} active suppliers
          </span>
        </div>
      </div>

      <DataTable data={suppliers} columns={columns} />
    </PageContainer>
  );
}
