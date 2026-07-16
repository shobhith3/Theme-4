"use client";

import { Database, Link2, FileText, Smartphone } from "lucide-react";

export function DataSourcesCard() {
  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
      <h3 className="text-[16px] font-bold text-text-primary mb-2 flex items-center gap-2">
        <Database className="w-4 h-4 text-[var(--color-accent)]" />
        How ProcureIQ Tracks Inventory
      </h3>
      <p className="text-[13px] text-text-secondary mb-5 leading-relaxed">
        ProcureIQ does not rely on manual daily entry. It acts as the procurement intelligence brain by connecting to your existing operational tools.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-border">
          <Smartphone className="w-5 h-5 text-[var(--color-accent)] mt-0.5 shrink-0" />
          <div>
            <div className="text-[13px] font-bold text-text-primary">POS / Billing Integration</div>
            <div className="text-[12px] text-text-secondary mt-1">
              Sales automatically reduce stock via Bill of Materials (BOM) or recipe mapping (e.g. 50 biryanis sold = 10kg chicken used).
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-border">
          <FileText className="w-5 h-5 text-[var(--color-accent)] mt-0.5 shrink-0" />
          <div>
            <div className="text-[13px] font-bold text-text-primary">Purchase Invoices</div>
            <div className="text-[12px] text-text-secondary mt-1">
              Approved purchase orders and received invoices automatically increase branch inventory levels.
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-border">
          <Link2 className="w-5 h-5 text-[var(--color-accent)] mt-0.5 shrink-0" />
          <div>
            <div className="text-[13px] font-bold text-text-primary">Transfer & Logistics</div>
            <div className="text-[12px] text-text-secondary mt-1">
              Branch-to-branch stock transfers and warehouse dispatches are tracked to adjust locations.
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-border">
          <Database className="w-5 h-5 text-[var(--color-accent)] mt-0.5 shrink-0" />
          <div>
            <div className="text-[13px] font-bold text-text-primary">Periodic Audits</div>
            <div className="text-[12px] text-text-secondary mt-1">
              Manual entry is only used for periodic physical stock audits to correct minor discrepancies.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
