"use client";

import { CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const approvals = [
  {
    id: "a1",
    decision: "Chicken Breast",
    type: "Hybrid",
    branch: "Hyderabad",
    impact: "₹33,600 protected",
    confidence: 92,
    status: "Critical",
  },
  {
    id: "a2",
    decision: "Tomatoes",
    type: "Transfer",
    branch: "Siddipet",
    impact: "₹2,140 saved",
    confidence: 95,
    status: "Opportunity",
  },
  {
    id: "a3",
    decision: "Cooking Oil",
    type: "Purchase",
    branch: "Siddipet",
    impact: "₹3,100 spend",
    confidence: 88,
    status: "High",
  },
  {
    id: "a4",
    decision: "Paneer",
    type: "Reduce Order",
    branch: "Hyderabad",
    impact: "₹1,780 avoided",
    confidence: 84,
    status: "Medium",
  },
];

export function ApprovalTable() {
  return (
    <div className="card-base bg-surface p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-semibold text-text-primary tracking-tight">Awaiting Approval</h3>
        </div>
        <button className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors">
          View all 4 pending
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Decision</th>
              <th className="pb-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Type</th>
              <th className="pb-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Branch</th>
              <th className="pb-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Financial Impact</th>
              <th className="pb-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Confidence</th>
              <th className="pb-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Status</th>
              <th className="pb-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {approvals.map((item) => (
              <tr key={item.id} className="hover:bg-surface-hover transition-colors group">
                <td className="py-4">
                  <span className="text-[14px] font-medium text-text-primary">{item.decision}</span>
                </td>
                <td className="py-4">
                  <span className="text-[13px] text-text-secondary">{item.type}</span>
                </td>
                <td className="py-4">
                  <span className="text-[13px] text-text-secondary">{item.branch}</span>
                </td>
                <td className="py-4">
                  <span className="text-[13px] font-medium tabular-nums text-text-primary">{item.impact}</span>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] tabular-nums text-text-primary">{item.confidence}%</span>
                    <div className="w-16 h-1.5 bg-background rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${item.confidence}%` }} />
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider",
                    item.status === "Critical" && "bg-critical-muted text-critical",
                    item.status === "High" && "bg-warning-muted text-warning",
                    item.status === "Medium" && "bg-info-muted text-info",
                    item.status === "Opportunity" && "bg-success-muted text-success"
                  )}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background hover:bg-white border border-border text-[12px] font-medium text-text-primary rounded transition-colors shadow-sm">
                    Review
                    <ArrowRight className="w-3 h-3 text-text-muted" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
