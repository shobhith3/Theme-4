"use client";

import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";

export function DecisionReasoningCard({ branchId }: { branchId?: string }) {
  const recommendations = useStore((s) => s.recommendations);
  
  const topDecision = recommendations.find(r => 
    r.status === "pending" && 
    r.urgency === "critical" &&
    (!branchId || r.branchId === branchId)
  ) || recommendations.find(r => 
    r.status === "pending" &&
    (!branchId || r.branchId === branchId)
  );

  if (!topDecision) return null;

  return (
    <div className="flex flex-col bg-white rounded-xl border border-border p-5.5 shadow-sm">
      
      {/* Header */}
      <div>
        <h3 className="text-[20px] font-bold text-text-primary tracking-tight">
          Risk Drivers
        </h3>
        <p className="text-[13px] text-text-secondary mt-1.5 leading-relaxed">
          {topDecision.urgency === "critical" ? "Four factors are converging on the same risk window." : "Key factors driving this recommendation."}
        </p>
      </div>

      {/* Factor Grid (2x2) */}
      <div className="grid grid-cols-2 gap-x-4.5 gap-y-3.5 mt-4.5">
        <div className="flex flex-col bg-surface rounded-[10px] p-3.5 min-w-0">
          <span className="text-[12px] font-medium text-text-secondary mb-1">Status</span>
          <span className="text-[20px] font-bold text-critical tabular-nums leading-none capitalize">{topDecision.urgency}</span>
        </div>
        <div className="flex flex-col bg-surface rounded-[10px] p-3.5 min-w-0">
          <span className="text-[12px] font-medium text-text-secondary mb-1">Protection</span>
          <span className="text-[20px] font-bold text-text-primary tabular-nums leading-none">₹{((topDecision.estimatedCost || 0) + (topDecision.estimatedSavings || 0)).toLocaleString()}</span>
        </div>
        <div className="flex flex-col bg-surface rounded-[10px] p-3.5 min-w-0">
          <span className="text-[12px] font-medium text-text-secondary mb-1">Confidence</span>
          <span className="text-[20px] font-bold text-text-primary tabular-nums leading-none">{topDecision.confidenceScore}%</span>
        </div>
        <div className="flex flex-col bg-surface rounded-[10px] p-3.5 min-w-0">
          <span className="text-[12px] font-medium text-text-secondary mb-1">Qty</span>
          <span className="text-[20px] font-bold text-text-primary tabular-nums leading-none">{topDecision.suggestedQty} {topDecision.unit}</span>
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
            { value: "Current", label: "CURRENT", color: "bg-text-primary", active: true },
            { value: "", label: "", color: "bg-text-muted/40", active: false },
            { value: "", label: "", color: "bg-text-muted/40", active: false },
            { value: "Safety", label: "SAFETY BREACH", color: "bg-warning", active: true },
            { value: "0", label: "STOCKOUT", color: "bg-critical", active: true },
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
            {topDecision.reasoning}
          </p>
        </div>
      </div>

    </div>
  );
}
