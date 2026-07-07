"use client";

import { cn } from "@/lib/utils";

export function DecisionReasoningCard() {
  return (
    <div className="flex flex-col bg-white rounded-xl border border-border p-5.5 shadow-sm">
      
      {/* Header */}
      <div>
        <h3 className="text-[20px] font-bold text-text-primary tracking-tight">
          Risk Drivers
        </h3>
        <p className="text-[13px] text-text-secondary mt-1.5 leading-relaxed">
          Four factors are converging on the same risk window.
        </p>
      </div>

      {/* Factor Grid (2x2) */}
      <div className="grid grid-cols-2 gap-x-4.5 gap-y-3.5 mt-4.5">
        <div className="flex flex-col bg-surface rounded-[10px] p-3.5 min-w-0">
          <span className="text-[12px] font-medium text-text-secondary mb-1">Weekend demand</span>
          <span className="text-[24px] font-bold text-critical tabular-nums leading-none">+38%</span>
        </div>
        <div className="flex flex-col bg-surface rounded-[10px] p-3.5 min-w-0">
          <span className="text-[12px] font-medium text-text-secondary mb-1">Inventory cover</span>
          <span className="text-[24px] font-bold text-text-primary tabular-nums leading-none">1.9 days</span>
        </div>
        <div className="flex flex-col bg-surface rounded-[10px] p-3.5 min-w-0">
          <span className="text-[12px] font-medium text-text-secondary mb-1">Supplier lead time</span>
          <span className="text-[24px] font-bold text-text-primary tabular-nums leading-none">1.4 days</span>
        </div>
        <div className="flex flex-col bg-surface rounded-[10px] p-3.5 min-w-0">
          <span className="text-[12px] font-medium text-text-secondary mb-1">Safety threshold</span>
          <span className="text-[24px] font-bold text-text-primary tabular-nums leading-none">10 kg</span>
        </div>
      </div>

      {/* Trajectory */}
      <div className="flex flex-col mt-5.5">
        <h4 className="text-[14px] font-[650] text-text-primary mb-3">Inventory trajectory</h4>
        
        <div className="relative flex items-center justify-between min-h-[92px] px-2 py-1 mb-5">
          {/* Connecting Line */}
          <div className="absolute left-3 right-3 top-[15px] h-[2px] bg-border-strong/40 -z-10" />
          
          {/* Nodes */}
          {[
            { value: "24 kg", label: "CURRENT", color: "bg-text-primary", active: true },
            { value: "18 kg", label: "", color: "bg-text-muted/40", active: false },
            { value: "11 kg", label: "", color: "bg-text-muted/40", active: false },
            { value: "5 kg", label: "SAFETY BREACH", color: "bg-warning", active: true },
            { value: "0 kg", label: "STOCKOUT", color: "bg-critical", active: true },
          ].map((node, i) => (
            <div key={i} className="flex flex-col items-center relative">
              <div className={cn(
                "w-3 h-3 rounded-full border-2 border-white shadow-sm",
                node.color
              )} />
              <div className="flex flex-col items-center absolute top-5 w-24 text-center">
                <span className="text-[12px] font-bold tabular-nums text-text-primary leading-none">
                  {node.value}
                </span>
                {node.label && (
                  <span className={cn(
                    "text-[9px] font-[650] uppercase tracking-[0.05em] mt-1.5",
                    node.color === 'bg-critical' ? 'text-critical' 
                    : node.color === 'bg-warning' ? 'text-warning'
                    : 'text-text-secondary'
                  )}>
                    {node.label}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Rationale */}
      <div className="mt-4.5">
        <div className="flex flex-col bg-surface rounded-[10px] p-3.5 border border-border/20">
          <span className="flex items-center gap-2 text-[11px] font-bold text-text-primary uppercase tracking-wider mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-intelligence)]" />
            AI RATIONALE
          </span>
          <p className="text-[14px] text-text-secondary leading-[1.5]">
            Weekend demand is rising faster than available stock. Transfer alone is insufficient, while full procurement creates unnecessary excess risk.
          </p>
        </div>
      </div>

    </div>
  );
}
