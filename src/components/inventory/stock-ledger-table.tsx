"use client";

import { useStore } from "@/store/useStore";

export function StockLedgerTable() {
  const stockTransactions = useStore(s => s.stockTransactions);

  if (stockTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-muted bg-white border border-border rounded-xl">
        <p>No stock transactions found. Update stock to see ledger entries.</p>
      </div>
    );
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'opening_stock': return { label: 'Opening Stock', color: 'bg-slate-100 text-slate-700' };
      case 'receive_stock': return { label: 'Receive', color: 'bg-blue-100 text-blue-700' };
      case 'transfer_in': return { label: 'Transfer In', color: 'bg-emerald-100 text-emerald-700' };
      case 'transfer_out': return { label: 'Transfer Out', color: 'bg-amber-100 text-amber-700' };
      case 'adjustment': return { label: 'Adjustment', color: 'bg-indigo-100 text-indigo-700' };
      case 'wastage': return { label: 'Wastage', color: 'bg-red-100 text-red-700' };
      case 'expiry': return { label: 'Expiry', color: 'bg-red-100 text-red-700' };
      case 'damage': return { label: 'Damage', color: 'bg-red-100 text-red-700' };
      default: return { label: type, color: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <div className="w-full overflow-x-auto bg-white border border-border rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface border-b border-border">
            <th className="py-3 px-4 text-[12px] font-bold text-text-muted uppercase tracking-wider">Date</th>
            <th className="py-3 px-4 text-[12px] font-bold text-text-muted uppercase tracking-wider">Type</th>
            <th className="py-3 px-4 text-[12px] font-bold text-text-muted uppercase tracking-wider">Item</th>
            <th className="py-3 px-4 text-[12px] font-bold text-text-muted uppercase tracking-wider">Branch</th>
            <th className="py-3 px-4 text-[12px] font-bold text-text-muted uppercase tracking-wider text-right">In</th>
            <th className="py-3 px-4 text-[12px] font-bold text-text-muted uppercase tracking-wider text-right">Out</th>
            <th className="py-3 px-4 text-[12px] font-bold text-text-muted uppercase tracking-wider text-right">Balance</th>
            <th className="py-3 px-4 text-[12px] font-bold text-text-muted uppercase tracking-wider">Reason / Ref</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {stockTransactions.map(tx => {
            const { label, color } = getTypeLabel(tx.type);
            return (
              <tr key={tx.id} className="hover:bg-surface-hover transition-colors">
                <td className="py-3 px-4 text-[13px] text-text-secondary whitespace-nowrap">
                  {new Date(tx.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${color}`}>
                    {label}
                  </span>
                </td>
                <td className="py-3 px-4 text-[13px] font-medium text-text-primary">{tx.itemName}</td>
                <td className="py-3 px-4 text-[13px] text-text-secondary">{tx.branchName}</td>
                <td className="py-3 px-4 text-[13px] font-bold text-success text-right">
                  {tx.quantityIn > 0 ? `+${tx.quantityIn}` : "-"}
                </td>
                <td className="py-3 px-4 text-[13px] font-bold text-critical text-right">
                  {tx.quantityOut > 0 ? `-${tx.quantityOut}` : "-"}
                </td>
                <td className="py-3 px-4 text-[14px] font-bold text-text-primary text-right tabular-nums">
                  {tx.balanceAfter} <span className="text-[11px] text-text-muted font-normal">{tx.unit}</span>
                </td>
                <td className="py-3 px-4 text-[12px] text-text-secondary">
                  {tx.reason || tx.reference || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
