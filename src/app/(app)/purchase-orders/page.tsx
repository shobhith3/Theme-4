"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { DataTable } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { useStore } from "@/store/useStore";
import { useState, useMemo } from "react";
import { PurchaseOrder } from "@/types";
import { CheckCircle2, Truck, Package, X } from "lucide-react";

export default function PurchaseOrdersPage() {
  const purchaseOrders = useStore(s => s.purchaseOrders);
  const receivePurchaseOrderStock = useStore(s => s.receivePurchaseOrderStock);
  const [activeTab, setActiveTab] = useState<PurchaseOrder['status'] | "all">("all");
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

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
    },
    {
      header: "Action",
      cell: (item: PurchaseOrder) => (
        <div className="flex justify-end">
          {item.status === "sent" ? (
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                receivePurchaseOrderStock(
                  item.id, 
                  item.lineItems.map(li => ({ itemId: li.itemId, quantity: li.quantity }))
                ); 
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-accent)] text-white rounded text-[12px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Receive
            </button>
          ) : (
            <span className="text-[12px] text-text-muted">
              {item.status === "fulfilled" ? "Received" : "Pending Dispatch"}
            </span>
          )}
        </div>
      ),
      align: "right" as const
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

      <DataTable data={filteredOrders} columns={columns} onRowClick={setSelectedPO} />

      {/* PO Detail Drawer */}
      {selectedPO && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity">
          <div className="w-[480px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <div className="flex flex-col">
                <h3 className="text-[18px] font-bold text-text-primary flex items-center gap-2">
                  {selectedPO.poNumber}
                  <StatusBadge status={selectedPO.status === 'sent' ? 'In Transit' : selectedPO.status === 'fulfilled' ? 'Delivered' : 'Approved'} />
                </h3>
                <span className="text-[13px] text-text-secondary mt-1">{selectedPO.supplierName} • {selectedPO.branchName}</span>
              </div>
              <button onClick={() => setSelectedPO(null)} className="p-2 hover:bg-surface rounded-full text-text-muted hover:text-text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-6 overflow-y-auto">
              <div>
                <h4 className="text-[13px] font-bold uppercase tracking-wider text-text-muted mb-3">Order Details</h4>
                <div className="bg-surface border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-surface-hover border-b border-border">
                      <tr>
                        <th className="py-2 px-3 font-medium text-text-secondary">Item</th>
                        <th className="py-2 px-3 font-medium text-text-secondary text-right">Qty</th>
                        <th className="py-2 px-3 font-medium text-text-secondary text-right">Unit Price</th>
                        <th className="py-2 px-3 font-medium text-text-secondary text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 bg-white">
                      {selectedPO.lineItems.map(item => (
                        <tr key={item.itemId}>
                          <td className="py-2 px-3 text-text-primary font-medium">{item.itemName}</td>
                          <td className="py-2 px-3 text-right">{item.quantity} {item.unit}</td>
                          <td className="py-2 px-3 text-right">₹{item.unitPrice}</td>
                          <td className="py-2 px-3 text-right font-bold">₹{item.totalPrice}</td>
                        </tr>
                      ))}
                      <tr className="bg-surface-hover">
                        <td colSpan={3} className="py-2 px-3 text-right font-bold text-text-secondary">Total Amount</td>
                        <td className="py-2 px-3 text-right font-bold text-text-primary">₹{selectedPO.totalAmount}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedPO.status === "sent" && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-blue-900">Ready to Receive</span>
                      <span className="text-[13px] text-blue-700 leading-relaxed">
                        This order is marked as in-transit. Once physically received, mark it here to instantly update the stock ledger.
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      receivePurchaseOrderStock(
                        selectedPO.id,
                        selectedPO.lineItems.map(li => ({ itemId: li.itemId, quantity: li.quantity }))
                      );
                      setSelectedPO(null);
                    }}
                    className="w-full py-2 bg-blue-600 text-white rounded-md text-[13px] font-bold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Receive Stock into Inventory
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
