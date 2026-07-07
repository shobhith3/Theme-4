"use client";

import { mockDecisions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function DecisionQueue() {
  return (
    <div className="flex flex-col w-full">
      
      <div className="mb-3.5">
        <h2 className="text-[21px] md:text-[22px] font-[700] text-text-primary mb-1">
          Decisions requiring attention
        </h2>
        <p className="text-[14px] text-text-secondary">
          Prioritized by financial impact and time sensitivity.
        </p>
      </div>

      {/* Structured List Surface */}
      <div className="flex flex-col bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        {mockDecisions.map((decision, index) => (
          <div 
            key={decision.id}
            className={cn(
              "flex flex-col md:grid md:grid-cols-[2.5fr_2.5fr_1.6fr_1.4fr_1fr_auto] gap-y-4 md:gap-x-4 items-start md:items-center min-h-[70px] md:h-[72px] p-4 lg:px-5 transition-colors group",
              index !== mockDecisions.length - 1 ? 'border-b border-border/50' : '',
              "hover:bg-surface-hover/50"
            )}
          >
            
            {/* Item */}
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] lg:text-[15px] font-[650] text-text-primary truncate">{decision.item}</span>
              <span className="text-[12px] lg:text-[13px] text-text-secondary truncate mt-1">{decision.branch}</span>
            </div>

            {/* Recommendation */}
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] lg:text-[11px] font-semibold text-text-muted uppercase tracking-[0.05em] leading-none mb-1.5">Recommendation</span>
              <span className="text-[13px] lg:text-[14px] font-medium text-text-primary truncate">{decision.strategyType}</span>
            </div>

            {/* Impact */}
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] lg:text-[11px] font-semibold text-text-muted uppercase tracking-[0.05em] leading-none mb-1.5">Impact</span>
              <div className="flex flex-col">
                <span className="text-[14px] font-[650] text-text-primary tabular-nums truncate">₹{decision.netProtection.toLocaleString()}</span>
                <span className="text-[11px] text-text-muted mt-0.5">Net protection</span>
              </div>
            </div>

            {/* Deadline */}
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] lg:text-[11px] font-semibold text-text-muted uppercase tracking-[0.05em] leading-none mb-1.5">Deadline</span>
              <span className="text-[13px] lg:text-[14px] font-bold text-text-primary truncate">{decision.timeToBreach}</span>
            </div>

            {/* Confidence */}
            <div className="flex items-center min-w-0">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--color-intelligence)]/10 rounded-full border border-[var(--color-intelligence)]/20">
                <div className="w-1 h-1 rounded-full bg-[var(--color-intelligence)]" />
                <span className="text-[12px] font-bold text-text-primary tabular-nums tracking-tight whitespace-nowrap">{decision.confidence}% confidence</span>
              </div>
            </div>

            {/* Action */}
            <div className="flex items-center justify-end w-full md:w-auto shrink-0">
              <button className="h-[36px] px-3 bg-white border border-border rounded-lg text-[13px] font-medium text-text-primary hover:bg-surface-hover hover:border-border-strong transition-all shadow-sm shrink-0">
                Review
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
