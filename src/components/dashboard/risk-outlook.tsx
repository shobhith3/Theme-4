"use client";

import { TrendingDown, Layers } from "lucide-react";
import { StatusBadge } from "../common/status-badge";

export function RiskOutlook() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      
      {/* Left Column: Risk Outlook */}
      <div className="flex flex-col bg-white border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] lg:text-[20px] font-bold text-text-primary tracking-tight">Risk Outlook</h2>
          <button className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors">
            View All
          </button>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-3 gap-2.5 mb-4.5">
          <div className="flex flex-col bg-surface rounded-lg p-3 border border-border/40">
            <span className="text-[20px] lg:text-[22px] font-bold text-critical tabular-nums leading-none">3</span>
            <span className="text-[12px] font-semibold text-text-primary mt-1.5">Critical</span>
            <span className="text-[11px] text-text-muted mt-1">Next 24 hours</span>
          </div>
          <div className="flex flex-col bg-surface rounded-lg p-3 border border-border/40">
            <span className="text-[20px] lg:text-[22px] font-bold text-warning tabular-nums leading-none">9</span>
            <span className="text-[12px] font-semibold text-text-primary mt-1.5">High Risk</span>
            <span className="text-[11px] text-text-muted mt-1">Next 48 hours</span>
          </div>
          <div className="flex flex-col bg-surface rounded-lg p-3 border border-border/40">
            <span className="text-[20px] lg:text-[22px] font-bold text-info tabular-nums leading-none">18</span>
            <span className="text-[12px] font-semibold text-text-primary mt-1.5">Monitored</span>
            <span className="text-[11px] text-text-muted mt-1">Next 7 days</span>
          </div>
        </div>

        {/* Top Risks List */}
        <div className="flex flex-col">
          <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">TOP RISKS</h4>
          <div className="flex flex-col">
            <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
              <span className="text-[13px] font-medium text-text-primary">Chicken Breast</span>
              <StatusBadge status="1.9 days cover" />
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
              <span className="text-[13px] font-medium text-text-primary">Tomatoes</span>
              <StatusBadge status="1.2 days cover" />
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
              <span className="text-[13px] font-medium text-text-primary">Milk</span>
              <StatusBadge status="1.0 days cover" />
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
              <span className="text-[13px] font-medium text-text-primary">Fresh Cream</span>
              <StatusBadge status="2.4 days cover" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Savings Opportunities */}
      <div className="flex flex-col bg-white border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] lg:text-[20px] font-bold text-text-primary tracking-tight">Savings Opportunities</h2>
          <button className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors">
            View All
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          
          <div className="flex items-start gap-3 p-3 lg:p-3.5 min-h-[58px] rounded-xl border border-border/60 hover:bg-surface-hover/50 transition-all cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-[var(--color-intelligence)]/10 flex items-center justify-center shrink-0 border border-[var(--color-intelligence)]/20">
              <Layers className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-bold text-text-primary truncate">Tomatoes</span>
                <span className="text-[14px] font-bold text-text-primary tabular-nums shrink-0">₹2,140 saved</span>
              </div>
              <span className="text-[13px] text-text-secondary mt-1 truncate">Transfer 18 kg from Warangal</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 lg:p-3.5 min-h-[58px] rounded-xl border border-border/60 hover:bg-surface-hover/50 transition-all cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-[var(--color-intelligence)]/10 flex items-center justify-center shrink-0 border border-[var(--color-intelligence)]/20">
              <TrendingDown className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-bold text-text-primary truncate">Paneer</span>
                <span className="text-[14px] font-bold text-text-primary tabular-nums shrink-0">₹1,780 avoided</span>
              </div>
              <span className="text-[13px] text-text-secondary mt-1 truncate">Reduce next order by 14 kg</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 lg:p-3.5 min-h-[58px] rounded-xl border border-border/60 hover:bg-surface-hover/50 transition-all cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-[var(--color-intelligence)]/10 flex items-center justify-center shrink-0 border border-[var(--color-intelligence)]/20">
              <Layers className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-bold text-text-primary truncate">Basmati Rice</span>
                <span className="text-[14px] font-bold text-text-primary tabular-nums shrink-0">₹3,240 saved</span>
              </div>
              <span className="text-[13px] text-text-secondary mt-1 truncate">Consolidate supplier order</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
