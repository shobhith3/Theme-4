"use client";

import { TrendingDown, Layers } from "lucide-react";
import { StatusBadge } from "../common/status-badge";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { useMemo } from "react";

export function RiskOutlook({ branchId }: { branchId?: string }) {
  const recommendations = useStore((s) => s.recommendations);
  
  const { criticalCount, highCount, monitoredCount, topRisks, savingsOpps } = useMemo(() => {
    const relevantRecs = branchId ? recommendations.filter(r => r.branchId === branchId) : recommendations;
    
    let criticalCount = 0;
    let highCount = 0;
    let monitoredCount = 0;
    
    const topRisks: { item: string, time: string }[] = [];
    const savingsOpps: { item: string, saved: number, text: string }[] = [];

    relevantRecs.forEach(r => {
      if (r.status !== "pending") return;
      
      if (r.urgency === "critical") criticalCount++;
      else if (r.urgency === "high") highCount++;
      else if (r.urgency === "medium" || r.urgency === "low") monitoredCount++;

      if (r.urgency === "critical" || r.urgency === "high") {
        topRisks.push({
          item: r.itemName,
          time: r.urgency === "critical" ? "1.9 days cover" : "3.4 days cover" // simplified
        });
      }

      if (r.estimatedSavings && r.estimatedSavings > 0) {
        savingsOpps.push({
          item: r.itemName,
          saved: r.estimatedSavings,
          text: r.type === "transfer" ? `Transfer ${r.suggestedQty} ${r.unit} from ${r.sourceBranchName || 'another branch'}` 
              : r.type === "reduce" ? `Reduce next order by ${r.suggestedQty} ${r.unit}`
              : `Consolidate supplier order`
        });
      }
    });

    return {
      criticalCount,
      highCount,
      monitoredCount,
      topRisks: topRisks.slice(0, 4),
      savingsOpps: savingsOpps.slice(0, 3)
    };
  }, [recommendations, branchId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      
      {/* Left Column: Risk Outlook */}
      <div className="flex flex-col bg-white border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] lg:text-[20px] font-bold text-text-primary tracking-tight">Risk Outlook</h2>
          <Link href="/inventory" className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors">
            View All
          </Link>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-3 gap-2.5 mb-4.5">
          <div className="flex flex-col bg-surface rounded-lg p-3 border border-border/40">
            <span className="text-[20px] lg:text-[22px] font-bold text-critical tabular-nums leading-none">{criticalCount}</span>
            <span className="text-[12px] font-semibold text-text-primary mt-1.5">Critical</span>
            <span className="text-[11px] text-text-muted mt-1">Next 24 hours</span>
          </div>
          <div className="flex flex-col bg-surface rounded-lg p-3 border border-border/40">
            <span className="text-[20px] lg:text-[22px] font-bold text-warning tabular-nums leading-none">{highCount}</span>
            <span className="text-[12px] font-semibold text-text-primary mt-1.5">High Risk</span>
            <span className="text-[11px] text-text-muted mt-1">Next 48 hours</span>
          </div>
          <div className="flex flex-col bg-surface rounded-lg p-3 border border-border/40">
            <span className="text-[20px] lg:text-[22px] font-bold text-info tabular-nums leading-none">{monitoredCount}</span>
            <span className="text-[12px] font-semibold text-text-primary mt-1.5">Monitored</span>
            <span className="text-[11px] text-text-muted mt-1">Next 7 days</span>
          </div>
        </div>

        {/* Top Risks List */}
        <div className="flex flex-col">
          <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">TOP RISKS</h4>
          <div className="flex flex-col">
            {topRisks.length > 0 ? topRisks.map((risk, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
                <span className="text-[13px] font-medium text-text-primary">{risk.item}</span>
                <StatusBadge status={risk.time} />
              </div>
            )) : (
              <div className="py-2.5 text-[13px] text-text-muted">No immediate risks detected.</div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Savings Opportunities */}
      <div className="flex flex-col bg-white border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] lg:text-[20px] font-bold text-text-primary tracking-tight">Savings Opportunities</h2>
          <Link href="/recommendations" className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors">
            View All
          </Link>
        </div>

        <div className="flex flex-col gap-2.5">
          {savingsOpps.length > 0 ? savingsOpps.map((opp, i) => (
            <div key={i} className="flex items-start gap-3 p-3 lg:p-3.5 min-h-[58px] rounded-xl border border-border/60 hover:bg-surface-hover/50 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-[var(--color-intelligence)]/10 flex items-center justify-center shrink-0 border border-[var(--color-intelligence)]/20">
                {opp.text.includes('Reduce') ? (
                  <TrendingDown className="w-5 h-5 text-[var(--color-accent)]" />
                ) : (
                  <Layers className="w-5 h-5 text-[var(--color-accent)]" />
                )}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-bold text-text-primary truncate">{opp.item}</span>
                  <span className="text-[14px] font-bold text-text-primary tabular-nums shrink-0">₹{opp.saved.toLocaleString()} saved</span>
                </div>
                <span className="text-[13px] text-text-secondary mt-1 truncate">{opp.text}</span>
              </div>
            </div>
          )) : (
            <div className="py-2.5 text-[13px] text-text-muted">No immediate savings opportunities.</div>
          )}
        </div>

      </div>

    </div>
  );
}
