"use client";

import { ArrowRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const decisions = [
  {
    id: "rec-001",
    item: "Chicken Breast",
    branch: "Hyderabad Central",
    status: "CRITICAL",
    risk: "Stockout projected in 46 hours",
    impact: "₹33,600 revenue at risk",
    strategy: "Hybrid replenishment",
    action: "Transfer 18 kg from Warangal + Purchase 22 kg from FreshRoute",
    confidence: 92,
  },
  {
    id: "rec-002",
    item: "Tomatoes",
    branch: "Siddipet Main",
    status: "OPPORTUNITY",
    risk: "Shortage in 31 hours",
    impact: "₹2,140 purchase cost avoided",
    strategy: "Transfer",
    action: "Transfer 18 kg from Warangal (prevents 18kg waste)",
    confidence: 95,
  },
  {
    id: "rec-003",
    item: "Cooking Oil",
    branch: "Siddipet Main",
    status: "HIGH",
    risk: "Demand running 27% above expected",
    impact: "₹3,100 spend",
    strategy: "Purchase",
    action: "Purchase 20 L before supplier cutoff",
    confidence: 88,
  },
];

export function CriticalDecisions() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary tracking-tight">Critical Decisions</h3>
        <button className="text-[13px] font-medium text-accent hover:text-accent-hover transition-colors">
          View all 12 recommendations
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {decisions.map((decision) => (
          <div key={decision.id} className="card-interactive p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-[15px] font-semibold text-text-primary leading-tight">{decision.item}</h4>
                <p className="text-[13px] text-text-secondary mt-0.5">{decision.branch}</p>
              </div>
              <span className={cn(
                "text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider",
                decision.status === "CRITICAL" && "bg-critical-muted text-critical",
                decision.status === "HIGH" && "bg-warning-muted text-warning",
                decision.status === "OPPORTUNITY" && "bg-success-muted text-success"
              )}>
                {decision.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-5">
              <div>
                <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1">Expected stock risk time</p>
                <p className="text-[13px] text-text-primary font-medium">{decision.risk}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1">Impact</p>
                <p className="text-[13px] text-text-primary font-medium">{decision.impact}</p>
              </div>
            </div>

            <div className="bg-background rounded-md p-3 mb-4 border border-border">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Recommended Strategy: {decision.strategy}</p>
                <div className="flex items-center gap-1 text-[11px] font-medium text-success relative group cursor-help w-fit">
                  <Info className="w-3.5 h-3.5" />
                  <span>{decision.confidence}% confidence</span>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-text-primary text-white text-[11px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    This score shows how reliable the forecast is based on available sales and inventory data.
                  </div>
                </div>
              </div>
              <p className="text-[13px] font-medium text-text-primary leading-relaxed">{decision.action}</p>
            </div>

            <div className="flex justify-end">
              <Link href={`/recommendations?id=${decision.id}`} className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-white border border-transparent text-[13px] font-medium rounded hover:bg-[var(--color-accent-hover)] transition-colors">
                Review Decision
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
