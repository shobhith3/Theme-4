"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, ShoppingCart, ArrowRightLeft, TrendingDown, X, ChevronRight } from "lucide-react";
import { getPendingRecommendations } from "@/services/procurement.service";
import type { Recommendation } from "@/types";

const typeConfig = {
  procure: { icon: ShoppingCart, label: "Purchase", color: "text-accent", bgColor: "bg-accent/10" },
  transfer: { icon: ArrowRightLeft, label: "Transfer", color: "text-success", bgColor: "bg-success/10" },
  reduce: { icon: TrendingDown, label: "Reduce", color: "text-warning", bgColor: "bg-warning/10" },
  expedite: { icon: ShoppingCart, label: "Expedite", color: "text-critical", bgColor: "bg-critical/10" },
};

const urgencyBadge = {
  critical: "badge-critical",
  high: "badge-warning",
  medium: "badge-info",
  low: "badge-success",
};

export function PendingApprovals() {
  const recommendations = getPendingRecommendations().slice(0, 4);

  return (
    <div className="card-base p-5 opacity-0 animate-fade-in" style={{ animationDelay: "450ms" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <CheckCircle className="w-4.5 h-4.5 text-accent" />
          <h3 className="text-sm font-semibold text-text-primary">Pending Approvals</h3>
        </div>
        <span className="text-[11px] font-medium text-text-muted bg-surface-hover px-2 py-1 rounded-md">
          {recommendations.length} pending
        </span>
      </div>

      {/* Approval Items */}
      <div className="space-y-2">
        {recommendations.map((rec, i) => (
          <ApprovalRow key={rec.id} recommendation={rec} index={i} />
        ))}
      </div>

      {/* View All */}
      <button className="flex items-center justify-center gap-1.5 w-full mt-4 py-2.5 rounded-lg text-xs font-medium text-accent hover:bg-accent/5 transition-colors border border-transparent hover:border-accent/15">
        View All Recommendations
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ApprovalRow({ recommendation, index }: { recommendation: Recommendation; index: number }) {
  const config = typeConfig[recommendation.type];
  const Icon = config.icon;

  return (
    <div
      className="flex items-center gap-3 px-3 py-3 rounded-lg bg-surface-hover/30 hover:bg-surface-hover transition-all duration-200 group opacity-0 animate-fade-in"
      style={{ animationDelay: `${index * 70 + 500}ms` }}
    >
      {/* Icon */}
      <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg shrink-0", config.bgColor)}>
        <Icon className={cn("w-4 h-4", config.color)} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary truncate">{recommendation.itemName}</span>
          <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm", urgencyBadge[recommendation.urgency])}>
            {recommendation.urgency}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted">
          <span>{config.label}</span>
          <span>·</span>
          <span>{recommendation.suggestedQty} {recommendation.unit}</span>
          <span>·</span>
          <span>{recommendation.branchName}</span>
        </div>
      </div>

      {/* Cost + Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right hidden sm:block mr-2">
          <p className="text-sm font-semibold text-text-primary">{formatCurrency(recommendation.estimatedCost)}</p>
          {recommendation.estimatedSavings > 0 && (
            <p className="text-[10px] text-success font-medium">Save {formatCurrency(recommendation.estimatedSavings)}</p>
          )}
        </div>

        {/* Quick Actions */}
        <button
          className="flex items-center justify-center w-7 h-7 rounded-md bg-success/10 text-success hover:bg-success/20 transition-colors opacity-0 group-hover:opacity-100"
          title="Approve"
        >
          <CheckCircle className="w-3.5 h-3.5" />
        </button>
        <button
          className="flex items-center justify-center w-7 h-7 rounded-md bg-critical/10 text-critical hover:bg-critical/20 transition-colors opacity-0 group-hover:opacity-100"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
