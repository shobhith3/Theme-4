"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { DataTable } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { useStore } from "@/store/useStore";
import { useState, useMemo } from "react";
import { PurchaseOrder } from "@/types";

export default function PurchaseOrdersPage() {
  const purchaseOrders = useStore(s => s.purchaseOrders);
  const [activeTab, setActiveTab] = useState<PurchaseOrder['status'] | "all">("all");

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return purchaseOrders;
    return purchaseOrders.filter(po => po.status === activeTab);
  }, [purchaseOrders, activeTab]);

  const columns = [
    { header: "PO Number", accessorKey: "poNumber" as const },
    { header: "Supplier", accessorKey: "supplierName" as const },
    { header: "Branch", accessorKey: "branchName" as const },
    { header: "Items", cell: (item: PurchaseOrder) => `${item.lineItems.length}`, align: "right" as const },
    { header: "Value", cell: (item: PurchaseOrder) => `₹${item.totalAmount.toLocaleString()}`, align: "right" as const },
    { header: "Expected Delivery", cell: (item: PurchaseOrder) => new Date(item.expectedDeliveryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) },
    {
      header: "Status",
      cell: (item: PurchaseOrder) => <StatusBadge status={item.status === 'sent' ? 'In Transit' : item.status === 'fulfilled' ? 'Delivered' : item.status === 'approved' ? 'Approved' : item.status === 'draft' ? 'Draft' : 'Review'} />
    }
  ];

  const TABS: { label: string, value: PurchaseOrder['status'] | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Approved", value: "approved" },
    { label: "In Transit", value: "sent" },
    { label: "Delivered", value: "fulfilled" }
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
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`pb-3 text-[14px] ${activeTab === tab.value ? 'font-bold text-text-primary border-b-2 border-[var(--color-intelligence)]' : 'font-medium text-text-secondary hover:text-text-primary transition-colors border-b-2 border-transparent'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable data={filteredOrders} columns={columns} />
    </PageContainer>
  );
}
