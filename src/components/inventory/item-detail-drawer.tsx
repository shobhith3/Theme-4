import React from 'react';
import { InventoryItem } from '@/types';
import { useStore } from '@/store/useStore';
import { X, ArrowUpRight, ArrowDownRight, Package, Clock, ShieldAlert } from 'lucide-react';

interface ItemDetailDrawerProps {
  item: InventoryItem | null;
  onClose: () => void;
}

export function ItemDetailDrawer({ item, onClose }: ItemDetailDrawerProps) {
  const branches = useStore((s) => s.branches);
  const transactions = useStore((s) => s.stockTransactions);

  if (!item) return null;

  const itemTransactions = transactions
    .filter(t => t.itemId === item.id && t.branchId === item.branchId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 50); // Get last 50 transactions

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div 
        className="w-[480px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border/50 shrink-0">
          <div className="flex flex-col">
            <h3 className="text-[18px] font-bold text-text-primary">{item.name}</h3>
            <span className="text-[13px] text-text-secondary">
              {branches.find(b => b.id === item.branchId)?.name || item.branchId} • {item.category}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface rounded-full text-text-muted hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Top Stats */}
          <div className="p-5 grid grid-cols-2 gap-4 border-b border-border/50">
            <div className="flex flex-col gap-1 p-3 bg-surface rounded-xl border border-border">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Current Stock</span>
              <span className="text-[20px] font-bold text-text-primary">{item.currentStock} <span className="text-[12px] font-medium text-text-muted">{item.unit}</span></span>
            </div>
            <div className="flex flex-col gap-1 p-3 bg-surface rounded-xl border border-border">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Safety Level</span>
              <span className="text-[20px] font-bold text-text-primary">{item.minStock} <span className="text-[12px] font-medium text-text-muted">{item.unit}</span></span>
            </div>
          </div>

          <div className="p-5 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-[13px] text-text-secondary">Incoming</span>
                <span className="text-[14px] font-bold tabular-nums">0 {item.unit}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-[13px] text-text-secondary">Days Cover</span>
                <span className="text-[14px] font-bold tabular-nums">{item.avgDailyUsage > 0 ? (item.currentStock / item.avgDailyUsage).toFixed(0) : 'N/A'}d</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-[13px] text-text-secondary">Unit Cost</span>
                <span className="text-[14px] font-bold tabular-nums">₹{item.unitCost?.toLocaleString() || 0}</span>
              </div>
            </div>

            {/* AI Insights block */}
            <div className="flex flex-col gap-3 p-4 bg-[var(--color-intelligence)]/5 rounded-xl border border-[var(--color-intelligence)]/20">
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-[var(--color-intelligence)] flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> AI Insights
              </h4>
              <p className="text-[13px] text-text-secondary leading-relaxed">
                Demand is trending up by 5%.
                {item.currentStock <= item.minStock * 1.5 ? ' Risk of stockout detected.' : ' Inventory levels are stable.'}
              </p>
            </div>

            {/* Ledger */}
            <div>
              <h4 className="text-[14px] font-bold text-text-primary mb-3">Recent Transactions</h4>
              {itemTransactions.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {itemTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-white border border-border rounded-lg shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          tx.quantityIn > 0 ? 'bg-success/10 text-success' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {tx.quantityIn > 0 ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-text-primary">
                            {tx.quantityIn > 0 ? 'Received' : 'Dispatched / Used'}
                          </span>
                          <span className="text-[11px] text-text-muted">{tx.reason || tx.type}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end text-right">
                        <span className={`text-[14px] font-bold tabular-nums ${tx.quantityIn > 0 ? 'text-success' : 'text-amber-600'}`}>
                          {tx.quantityIn > 0 ? '+' : '-'}{tx.quantityIn > 0 ? tx.quantityIn : tx.quantityOut} {tx.unit}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          {new Date(tx.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[13px] text-text-muted p-4 text-center border border-dashed border-border rounded-lg">
                  No recent transactions for this item.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
