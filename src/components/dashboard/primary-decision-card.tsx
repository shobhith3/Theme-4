"use client";

import { ArrowRight, TrendingDown } from "lucide-react";
import { StatusBadge } from "../common/status-badge";

export function PrimaryDecisionCard() {
  return (
    <div className="flex flex-col bg-white rounded-xl border border-border p-6 shadow-sm">

      {/* ZONE 1: Decision Identity */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <StatusBadge status="Critical" />
          <span className="text-[13px] font-medium text-text-secondary">
            Hyderabad Central
          </span>
        </div>
        <span className="text-[12px] font-medium text-text-muted shrink-0">
          Decision · D-2048
        </span>
      </div>

      {/* Main Title */}
      <h2 className="text-[24px] md:text-[28px] lg:text-[30px] font-[700] text-text-primary leading-[1.1] max-w-[780px] mt-4 mb-5.5">
        Chicken Breast will breach safety stock in 46 hours.
      </h2>

      {/* ZONE 2: Risk & Impact Metrics */}
      <div className="grid grid-cols-3 gap-5 mb-5.5">
        <div className="flex flex-col min-w-0">
          <span className="text-[28px] lg:text-[30px] font-[700] text-text-primary leading-none tabular-nums">
            ₹33,600
          </span>
          <span className="text-[12px] lg:text-[13px] font-medium text-text-secondary mt-1.5">
            Revenue exposed
          </span>
        </div>
        <div className="flex flex-col min-w-0 border-l border-border/40 pl-5">
          <span className="text-[28px] lg:text-[30px] font-[700] text-text-primary leading-none tabular-nums">
            46 hrs
          </span>
          <span className="text-[12px] lg:text-[13px] font-medium text-text-secondary mt-1.5">
            Time to breach
          </span>
        </div>
        <div className="flex flex-col min-w-0 border-l border-border/40 pl-5">
          <span className="text-[28px] lg:text-[30px] font-[700] text-text-primary leading-none tabular-nums">
            92%
          </span>
          <span className="text-[12px] lg:text-[13px] font-medium text-text-secondary mt-1.5">
            Forecast confidence
          </span>
        </div>
      </div>

      {/* ZONE 3: AI Recommendation Surface */}
      <div className="flex flex-col bg-[#F6FAF8] rounded-xl border border-[#E4EDE8] p-4.5">

        {/* Recommendation Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-[7px] h-[7px] rounded-full bg-[var(--color-intelligence)] shrink-0" />
            <span className="text-[11px] font-[650] uppercase tracking-[0.08em] text-text-secondary">
              AI RECOMMENDED ACTION
            </span>
          </div>
          <span className="text-[11px] font-[600] text-text-muted bg-white border border-border/60 px-2 py-0.5 rounded-md tabular-nums shrink-0">
            92% confidence
          </span>
        </div>

        {/* Strategy Title */}
        <h3 className="text-[20px] font-[700] text-text-primary tracking-tight mt-[7px]">
          Hybrid replenishment
        </h3>

        {/* Action Rows */}
        <div className="flex flex-col gap-2.5 mt-3.5">
          {/* Transfer */}
          <div className="grid grid-cols-[36px_minmax(0,1fr)_auto] gap-x-3 items-center min-h-[60px] bg-white rounded-[10px] border border-border/60 px-3.5 py-2.5">
            <div className="flex items-center justify-center">
              <ArrowRight className="w-[17px] h-[17px] text-text-muted" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-[10px] font-[600] text-text-muted uppercase tracking-[0.06em] leading-none mb-1">TRANSFER</span>
              <span className="text-[13px] font-medium text-text-primary truncate">Warangal → Hyderabad Central</span>
            </div>
            <span className="text-[14px] font-[700] text-text-primary tabular-nums pl-3.5">18 kg</span>
          </div>

          {/* Purchase */}
          <div className="grid grid-cols-[36px_minmax(0,1fr)_auto] gap-x-3 items-center min-h-[60px] bg-white rounded-[10px] border border-border/60 px-3.5 py-2.5">
            <div className="flex items-center justify-center">
              <TrendingDown className="w-[17px] h-[17px] text-text-muted" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-[10px] font-[600] text-text-muted uppercase tracking-[0.06em] leading-none mb-1">PURCHASE</span>
              <span className="text-[13px] font-medium text-text-primary truncate">FreshRoute Foods</span>
            </div>
            <span className="text-[14px] font-[700] text-text-primary tabular-nums pl-3.5">22 kg</span>
          </div>
        </div>
      </div>

      {/* ZONE 4: Financial Outcome + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mt-4.5">
        <div className="flex flex-col">
          <span className="text-[12px] font-medium text-text-secondary">
            Estimated net protection
          </span>
          <span className="text-[26px] font-[700] text-text-primary tabular-nums leading-none mt-1">
            ₹31,410
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="h-[42px] px-4 bg-white border border-border rounded-[9px] text-[14px] font-medium text-text-primary hover:bg-surface-hover hover:border-border-strong transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-accent)]">
            View Inventory
          </button>
          <button className="h-[42px] px-4 bg-[var(--color-accent)] text-white border border-transparent rounded-[9px] text-[14px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-accent)]">
            Review Decision
          </button>
        </div>
      </div>

    </div>
  );
}
