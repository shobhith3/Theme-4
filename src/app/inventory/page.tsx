"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { DataTable } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { mockInventory } from "@/lib/mock-data";
import { Filter, Search } from "lucide-react";

export default function InventoryPage() {
  const columns = [
    { header: "Item", accessorKey: "item" as const },
    { header: "Category", accessorKey: "category" as const },
    { header: "Branch", accessorKey: "branch" as const },
    { header: "On Hand", accessorKey: "onHand" as const, align: "right" as const },
    { header: "Incoming", accessorKey: "incoming" as const, align: "right" as const },
    { header: "Days Cover", accessorKey: "daysCover" as const, align: "right" as const },
    { header: "Safety Stock", accessorKey: "safetyStock" as const, align: "right" as const },
    { header: "Demand Trend", accessorKey: "demandTrend" as const, align: "right" as const },
    { 
      header: "Projected Status", 
      cell: (item: typeof mockInventory[0]) => <StatusBadge status={item.status} /> 
    },
    {
      header: "Action",
      cell: (item: typeof mockInventory[0]) => (
        <button className="text-[13px] font-medium text-[var(--color-intelligence-text)] hover:underline">
          {item.action}
        </button>
      )
    }
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Inventory Network" 
        description="Monitor stock health, days of cover, incoming supply, and predicted risk across every location." 
      />

      {/* Top Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="flex flex-col bg-white border border-border rounded-xl p-4">
          <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-1">Total Value</span>
          <span className="text-[24px] font-bold text-text-primary tabular-nums">₹12.8L</span>
        </div>
        <div className="flex flex-col bg-white border border-border rounded-xl p-4">
          <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-1">At-Risk SKUs</span>
          <span className="text-[24px] font-bold text-critical tabular-nums">18</span>
        </div>
        <div className="flex flex-col bg-white border border-border rounded-xl p-4">
          <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-1">Overstock Value</span>
          <span className="text-[24px] font-bold text-amber-600 tabular-nums">₹31.6K</span>
        </div>
        <div className="flex flex-col bg-white border border-border rounded-xl p-4">
          <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-1">Expiring Soon</span>
          <span className="text-[24px] font-bold text-text-primary tabular-nums">7</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-md w-full max-w-sm">
          <Search className="w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search items..." 
            className="bg-transparent border-none outline-none text-[13px] text-text-primary w-full placeholder:text-text-muted"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-md text-[13px] font-medium text-text-primary hover:bg-surface-hover">
            <Filter className="w-4 h-4 text-text-muted" />
            Branch
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-md text-[13px] font-medium text-text-primary hover:bg-surface-hover">
            <Filter className="w-4 h-4 text-text-muted" />
            Category
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-md text-[13px] font-medium text-text-primary hover:bg-surface-hover">
            <Filter className="w-4 h-4 text-text-muted" />
            Risk
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable data={mockInventory} columns={columns} onRowClick={(item) => console.log(item)} />
    </PageContainer>
  );
}
