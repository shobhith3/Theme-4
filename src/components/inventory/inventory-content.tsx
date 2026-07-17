"use client";

import { PageHeader } from "@/components/common/page-header";
import { DataTable } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { useStore } from "@/store/useStore";
import { Filter, Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { StockIntakeCenter } from "@/components/inventory/stock-intake-center";
import { StockLedgerTable } from "@/components/inventory/stock-ledger-table";
import { InventoryItem } from "@/types";
import { GuidedDecisionReview } from "@/components/decision/guided-decision-review";
import { ItemDetailDrawer } from "@/components/inventory/item-detail-drawer";

export default function InventoryContent() {
  const searchParams = useSearchParams();
  const inventory = useStore((s) => s.inventory);
  const branches = useStore((s) => s.branches);

  const initialSearch = searchParams.get("item") || "";
  const initialBranch = searchParams.get("branch") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<"current" | "ledger">("current");
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);

  // Initialize from URL params once
  useEffect(() => {
    setIsMounted(true);
    if (initialSearch) {
      const item = inventory.find(i => i.id === initialSearch);
      if (item) setSearchQuery(item.name);
    }
    if (initialBranch) {
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
    {
      header: "Demand Trend", cell: (item: InventoryItem) => (
        <span className={"text-info"}>
          +5%
        </span>
      ), align: "right" as const
    },
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
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedDecisionId(rec.id); }}
                className="text-[13px] font-medium text-[var(--color-accent)] hover:underline"
              >
                Review Decision
              </button>
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

  if (!isMounted) {
    return <div className="p-8 text-center text-text-muted">Loading inventory data...</div>;
  }

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
          <a
            href="/stock-intake"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] border border-transparent rounded-md text-[13px] font-bold text-white hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm ml-2"
          >
            Update Stock
          </a>
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
      <ItemDetailDrawer item={selectedItem} onClose={() => setSelectedItem(null)} />

      
      {selectedDecisionId && (
        <GuidedDecisionReview
          isOpen={true}
          decisionId={selectedDecisionId}
          onClose={() => setSelectedDecisionId(null)}
        />
      )}
    </>
  );
}
