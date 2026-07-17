"use client";

import { DataTable } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { useState } from "react";
import { X, Truck, ShieldAlert, Star, TrendingUp, Clock, PackageCheck } from "lucide-react";

export default function SuppliersContent({ initialSuppliers }: { initialSuppliers: any[] }) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);

  const columns = [
    { header: "Supplier", accessorKey: "name" as const },
    { 
      header: "Categories", 
      cell: (item: any) => item.itemCategories.join(", ") 
    },
    { header: "Lead Time", cell: (item: any) => `${item.avgLeadTimeDays} days`, align: "right" as const },
    { header: "On-Time Delivery", cell: (item: any) => `${item.onTimeDeliveryRate}%`, align: "right" as const },
    { header: "Defect Rate", cell: (item: any) => `${item.defectRate}%`, align: "right" as const },
    { header: "Reliability", cell: (item: any) => `${item.reliabilityScore}%`, align: "right" as const },
    {
      header: "Status",
      cell: (item: any) => (
        <StatusBadge status={item.reliabilityScore > 90 ? 'healthy' : item.reliabilityScore > 80 ? 'warning' : 'critical'} />
      )
    }
  ];

  return (
    <>
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

      <DataTable data={suppliers} columns={columns} onRowClick={(item) => setSelectedSupplier(item)} />

      {/* Supplier Detail Drawer */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity">
          <div className="w-[480px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <div className="flex flex-col">
                <h3 className="text-[18px] font-bold text-text-primary flex items-center gap-2">
                  {selectedSupplier.name}
                  <StatusBadge status={selectedSupplier.reliabilityScore > 90 ? 'healthy' : selectedSupplier.reliabilityScore > 80 ? 'warning' : 'critical'} />
                </h3>
                <span className="text-[13px] text-text-secondary mt-1">{selectedSupplier.itemCategories.join(", ")}</span>
              </div>
              <button onClick={() => setSelectedSupplier(null)} className="p-2 hover:bg-surface rounded-full text-text-muted hover:text-text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-6 overflow-y-auto">
              {/* Performance Metrics */}
              <div>
                <h4 className="text-[13px] font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Performance Metrics
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-surface border border-border rounded-lg">
                    <span className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">On-Time Delivery</span>
                    <span className="text-[18px] font-bold text-text-primary flex items-center gap-2">
                      <Truck className="w-4 h-4 text-success" />
                      {selectedSupplier.onTimeDeliveryRate}%
                    </span>
                  </div>
                  <div className="p-3 bg-surface border border-border rounded-lg">
                    <span className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Defect Rate</span>
                    <span className="text-[18px] font-bold text-text-primary flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-warning" />
                      {selectedSupplier.defectRate}%
                    </span>
                  </div>
                  <div className="p-3 bg-surface border border-border rounded-lg">
                    <span className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Avg Lead Time</span>
                    <span className="text-[18px] font-bold text-text-primary flex items-center gap-2">
                      <Clock className="w-4 h-4 text-info" />
                      {selectedSupplier.avgLeadTimeDays} Days
                    </span>
                  </div>
                  <div className="p-3 bg-surface border border-border rounded-lg">
                    <span className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Reliability Score</span>
                    <span className="text-[18px] font-bold text-text-primary flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      {selectedSupplier.reliabilityScore}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <h4 className="text-[13px] font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
                  <PackageCheck className="w-4 h-4" /> Recent Orders
                </h4>
                <div className="flex flex-col gap-3">
                  {selectedSupplier.recentOrders.length === 0 ? (
                    <div className="text-[13px] text-text-muted text-center py-4 border border-border/50 rounded-lg">
                      No recent orders found.
                    </div>
                  ) : (
                    selectedSupplier.recentOrders.map((po: any) => (
                      <div key={po.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-surface transition-colors cursor-pointer">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-text-primary">{po.poNumber}</span>
                          <span className="text-[12px] text-text-secondary">{new Date(po.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[13px] font-bold text-text-primary">₹{po.amount.toLocaleString()}</span>
                          <span className="text-[11px] px-2 py-0.5 bg-success/10 text-success rounded font-medium mt-1 uppercase">
                            {po.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
