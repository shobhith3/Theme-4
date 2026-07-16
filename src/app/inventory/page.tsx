"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { DataTable } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { useStore } from "@/store/useStore";
import { Filter, Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, useEffect } from "react";
import { StockIntakeCenter } from "@/components/inventory/stock-intake-center";
import { StockLedgerTable } from "@/components/inventory/stock-ledger-table";
import { InventoryItem } from "@/types";

function InventoryContent() {
  const searchParams = useSearchParams();
  const inventory = useStore((s) => s.inventory);
  const branches = useStore((s) => s.branches);
  
  const initialSearch = searchParams.get("item") || "";
  const initialBranch = searchParams.get("branch") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"current" | "ledger">("current");

  // Initialize from URL params once
  useEffect(() => {
    if (initialSearch) {
      // the param is an ID, find the name or just set it
      const item = inventory.find(i => i.id === initialSearch);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (item) setSearchQuery(item.name);
    }
    if (initialBranch) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedBranch(initialBranch);
    }
  }, [initialSearch, initialBranch, inventory]);

  const filteredData = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBranch = selectedBranch === "all" || item.branchId === selectedBranch;
      return matchesSearch && matchesBranch;
    });
  }, [inventory, searchQuery, selectedBranch]);

  const columns = [
    { header: "Item", accessorKey: "name" as const },
    { header: "Category", accessorKey: "category" as const },
    { header: "Branch", cell: (item: InventoryItem) => branches.find(b => b.id === item.branchId)?.name || item.branchId, align: "left" as const },
    { header: "On Hand", cell: (item: InventoryItem) => `${item.currentStock} ${item.unit}`, align: "right" as const },
    { header: "Incoming", cell: (item: InventoryItem) => `0 ${item.unit}`, align: "right" as const },
    { header: "Days Cover", cell: (item: InventoryItem) => `${item.avgDailyUsage > 0 ? (item.currentStock / item.avgDailyUsage).toFixed(0) : 'N/A'}d`, align: "right" as const },
    { header: "Safety Stock", cell: (item: InventoryItem) => `${item.minStock} ${item.unit}`, align: "right" as const },
    { header: "Demand Trend", cell: (item: InventoryItem) => (
        <span className={"text-info"}>
          +5%
        </span>
      ), align: "right" as const },
    { 
      header: "Projected Status", 
      cell: (item: InventoryItem) => <StatusBadge status={item.currentStock <= item.minStock ? 'Critical' : item.currentStock <= item.minStock * 1.5 ? 'High' : 'Monitored'} /> 
    },
    {
      header: "Action",
      cell: (item: InventoryItem) => {
        const rec = useStore.getState().recommendations.find(r => r.itemId === item.id && r.branchId === item.branchId && r.status === "pending");
        return (
          <div className="flex items-center gap-3 justify-end">
            {rec ? (
              <a 
                href={`/recommendations?id=${rec.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-[13px] font-medium text-[var(--color-accent)] hover:underline"
              >
                Review Decision
              </a>
            ) : null}
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
              className="text-[13px] font-medium text-text-secondary hover:text-text-primary hover:underline"
            >
              View Stock Detail
            </button>
          </div>
        );
      },
      align: "right" as const
    }
  ];

  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * (item.unitCost || 0)), 0);
  const overstockValue = inventory.filter(i => i.currentStock > i.maxStock).reduce((sum, item) => sum + ((item.currentStock - item.maxStock) * (item.unitCost || 0)), 0);
  const atRiskCount = inventory.filter(i => i.currentStock <= i.minStock * 1.5).length;

  return (
    <>
      <PageHeader 
        title="Inventory Network" 
        description="Monitor stock health, days of cover, incoming supply, and predicted risk across every location." 
      />

      {/* Top Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="flex flex-col bg-white border border-border rounded-xl p-4">
          <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-1">Total Value</span>
          <span className="text-[24px] font-bold text-text-primary tabular-nums">₹{(totalValue / 100000).toFixed(1)}L</span>
        </div>
        <div className="flex flex-col bg-white border border-border rounded-xl p-4">
          <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-1">At-Risk SKUs</span>
          <span className="text-[24px] font-bold text-critical tabular-nums">{atRiskCount}</span>
        </div>
        <div className="flex flex-col bg-white border border-border rounded-xl p-4">
          <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-1">Overstock Value</span>
          <span className="text-[24px] font-bold text-amber-600 tabular-nums">₹{(overstockValue / 1000).toFixed(1)}K</span>
        </div>
        <div className="flex flex-col bg-white border border-border rounded-xl p-4">
          <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-1">Expiring Soon</span>
          <span className="text-[24px] font-bold text-text-primary tabular-nums">7</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-md w-full max-w-sm focus-within:border-border-strong focus-within:ring-1 focus-within:ring-[var(--color-accent)] transition-all">
          <Search className="w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search items..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-[13px] text-text-primary w-full placeholder:text-text-muted"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="all">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-md text-[13px] font-medium text-text-primary hover:bg-surface-hover pointer-events-none">
              <Filter className="w-4 h-4 text-text-muted" />
              {selectedBranch === "all" ? "Branch" : branches.find(b => b.id === selectedBranch)?.name || "Branch"}
            </button>
          </div>
          <button 
            onClick={() => setIsIntakeOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] border border-transparent rounded-md text-[13px] font-bold text-white hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm ml-2"
          >
            Update Stock
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 mb-4 border-b border-border">
        <button 
          onClick={() => setActiveTab("current")}
          className={`pb-3 text-[14px] font-bold transition-colors border-b-2 ${activeTab === "current" ? "text-text-primary border-[var(--color-accent)]" : "text-text-muted border-transparent hover:text-text-primary"}`}
        >
          Current Stock
        </button>
        <button 
          onClick={() => setActiveTab("ledger")}
          className={`pb-3 text-[14px] font-bold transition-colors border-b-2 ${activeTab === "ledger" ? "text-text-primary border-[var(--color-accent)]" : "text-text-muted border-transparent hover:text-text-primary"}`}
        >
          Transaction Ledger
        </button>
      </div>

      {/* Content */}
      {activeTab === "current" ? (
        <DataTable data={filteredData} columns={columns} onRowClick={(item) => setSelectedItem(item)} />
      ) : (
        <StockLedgerTable />
      )}

      {/* Detail Drawer overlay */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity">
          <div className="w-[480px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <div className="flex flex-col">
                <h3 className="text-[18px] font-bold text-text-primary">{selectedItem.name}</h3>
                <span className="text-[13px] text-text-secondary">{branches.find(b => b.id === selectedItem.branchId)?.name || selectedItem.branchId} • {selectedItem.category}</span>
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-surface rounded-full text-text-muted hover:text-text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-6 overflow-y-auto">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-[13px] text-text-secondary">On Hand</span>
                  <span className="text-[14px] font-bold tabular-nums">{selectedItem.currentStock} {selectedItem.unit}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-[13px] text-text-secondary">Incoming</span>
                  <span className="text-[14px] font-bold tabular-nums">0 {selectedItem.unit}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-[13px] text-text-secondary">Safety Stock</span>
                  <span className="text-[14px] font-bold tabular-nums">{selectedItem.minStock} {selectedItem.unit}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-[13px] text-text-secondary">Days Cover</span>
                  <span className="text-[14px] font-bold tabular-nums">{selectedItem.avgDailyUsage > 0 ? (selectedItem.currentStock / selectedItem.avgDailyUsage).toFixed(0) : 'N/A'}d</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-[13px] text-text-secondary">Unit Cost</span>
                  <span className="text-[14px] font-bold tabular-nums">₹{selectedItem.unitCost?.toLocaleString() || 0}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 p-4 bg-surface rounded-xl border border-border/50">
                 <h4 className="text-[13px] font-bold uppercase tracking-wider text-text-muted">AI Insights</h4>
                 <p className="text-[14px] text-text-secondary leading-relaxed">
                   Demand is trending up by 5%. 
                   {selectedItem.currentStock <= selectedItem.minStock * 1.5 ? ' Risk of stockout detected.' : ' Inventory levels are stable.'}
                 </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Intake Center Modal */}
      <StockIntakeCenter isOpen={isIntakeOpen} onClose={() => setIsIntakeOpen(false)} />
    </>
  );
}

export default function InventoryPage() {
  return (
    <PageContainer>
      <Suspense fallback={<div className="p-8 text-center text-text-muted">Loading inventory data...</div>}>
        <InventoryContent />
      </Suspense>
    </PageContainer>
  );
}
