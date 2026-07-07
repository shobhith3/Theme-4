"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Package, AlertTriangle, FileText, Building2, X } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const store = useStore();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onClose(); // toggle is handled in topbar, actually we should just open if it's not open, but let topbar handle the shortcut
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const lowerQuery = query.toLowerCase();

  const matchedItems = query ? store.inventory.filter(i => 
    i.name.toLowerCase().includes(lowerQuery) || i.category.toLowerCase().includes(lowerQuery)
  ).slice(0, 3) : [];

  const matchedSuppliers = query ? store.suppliers.filter(s =>
    s.name.toLowerCase().includes(lowerQuery) || s.itemCategories.some(c => c.toLowerCase().includes(lowerQuery))
  ).slice(0, 3) : [];

  const matchedDecisions = query ? store.recommendations.filter(r =>
    r.id.toLowerCase().includes(lowerQuery) || r.itemName.toLowerCase().includes(lowerQuery) || r.type.toLowerCase().includes(lowerQuery)
  ).slice(0, 3) : [];

  const matchedOrders = query ? store.purchaseOrders.filter(po =>
    po.poNumber.toLowerCase().includes(lowerQuery) || po.supplierName.toLowerCase().includes(lowerQuery)
  ).slice(0, 3) : [];

  const matchedBranches = query ? store.branches.filter(b =>
    b.name.toLowerCase().includes(lowerQuery) || b.city.toLowerCase().includes(lowerQuery)
  ).slice(0, 3) : [];

  const hasResults = query && (
    matchedItems.length > 0 ||
    matchedSuppliers.length > 0 ||
    matchedDecisions.length > 0 ||
    matchedOrders.length > 0 ||
    matchedBranches.length > 0
  );

  const handleSelect = (url: string) => {
    router.push(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-[600px] bg-surface border border-border rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-text-muted shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-[15px] text-text-primary placeholder:text-text-muted"
            placeholder="Search items, suppliers, decisions, or orders..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary rounded-md hover:bg-surface-hover">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!query && (
            <div className="p-4 text-center text-[13px] text-text-muted">
              Type to start searching...
            </div>
          )}
          
          {query && !hasResults && (
            <div className="p-4 text-center text-[13px] text-text-muted">
              No matching items, suppliers, decisions, or orders.
            </div>
          )}

          {matchedItems.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Items</div>
              {matchedItems.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => handleSelect(`/inventory?item=${item.id}&branch=${item.branchId}`)}
                  className="w-full flex items-center px-3 py-2 text-left rounded-md hover:bg-surface-hover group"
                >
                  <Package className="w-4 h-4 text-text-muted mr-3 group-hover:text-primary" />
                  <div className="flex-1 overflow-hidden">
                    <div className="text-[13px] font-medium text-text-primary truncate">{item.name}</div>
                    <div className="text-[12px] text-text-secondary truncate">Inventory Item · {store.branches.find(b => b.id === item.branchId)?.name || item.branchId}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {matchedDecisions.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Decisions</div>
              {matchedDecisions.map(rec => (
                <button 
                  key={rec.id} 
                  onClick={() => handleSelect(`/recommendations?id=${rec.id}`)}
                  className="w-full flex items-center px-3 py-2 text-left rounded-md hover:bg-surface-hover group"
                >
                  <AlertTriangle className="w-4 h-4 text-text-muted mr-3 group-hover:text-primary" />
                  <div className="flex-1 overflow-hidden">
                    <div className="text-[13px] font-medium text-text-primary truncate">{rec.id}</div>
                    <div className="text-[12px] text-text-secondary truncate">Decision · {rec.itemName} · {rec.urgency}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {matchedSuppliers.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Suppliers</div>
              {matchedSuppliers.map(sup => (
                <button 
                  key={sup.id} 
                  onClick={() => handleSelect(`/suppliers?id=${sup.id}`)}
                  className="w-full flex items-center px-3 py-2 text-left rounded-md hover:bg-surface-hover group"
                >
                  <Building2 className="w-4 h-4 text-text-muted mr-3 group-hover:text-primary" />
                  <div className="flex-1 overflow-hidden">
                    <div className="text-[13px] font-medium text-text-primary truncate">{sup.name}</div>
                    <div className="text-[12px] text-text-secondary truncate">Supplier · {sup.onTimeDeliveryRate}% on-time</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {matchedOrders.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Purchase Orders</div>
              {matchedOrders.map(po => (
                <button 
                  key={po.id} 
                  onClick={() => handleSelect(`/purchase-orders?id=${po.id}`)}
                  className="w-full flex items-center px-3 py-2 text-left rounded-md hover:bg-surface-hover group"
                >
                  <FileText className="w-4 h-4 text-text-muted mr-3 group-hover:text-primary" />
                  <div className="flex-1 overflow-hidden">
                    <div className="text-[13px] font-medium text-text-primary truncate">{po.poNumber}</div>
                    <div className="text-[12px] text-text-secondary truncate">Purchase Order · {po.supplierName} · {po.status}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {matchedBranches.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Branches</div>
              {matchedBranches.map(branch => (
                <button 
                  key={branch.id} 
                  onClick={() => handleSelect(`/command-center?branch=${branch.id}`)}
                  className="w-full flex items-center px-3 py-2 text-left rounded-md hover:bg-surface-hover group"
                >
                  <Building2 className="w-4 h-4 text-text-muted mr-3 group-hover:text-primary" />
                  <div className="flex-1 overflow-hidden">
                    <div className="text-[13px] font-medium text-text-primary truncate">{branch.name}</div>
                    <div className="text-[12px] text-text-secondary truncate">Branch · {branch.city}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
