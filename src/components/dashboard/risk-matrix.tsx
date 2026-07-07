"use client";

import { cn } from "@/lib/utils";
import { getStockoutRisks, type StockoutRisk } from "@/services/forecast.service";
import { AlertTriangle } from "lucide-react";

const riskColors = {
  critical: { bg: "bg-critical", text: "text-critical", bar: "bg-critical" },
  high: { bg: "bg-warning", text: "text-warning", bar: "bg-warning" },
  medium: { bg: "bg-info", text: "text-info", bar: "bg-info" },
  low: { bg: "bg-success", text: "text-success", bar: "bg-success" },
};

export function RiskMatrix() {
  const risks = getStockoutRisks();

  // Group by risk level
  const critical = risks.filter((r) => r.riskLevel === "critical");
  const high = risks.filter((r) => r.riskLevel === "high");
  const medium = risks.filter((r) => r.riskLevel === "medium");

  const topRisks = [...critical, ...high, ...medium].slice(0, 8);

  return (
    <div className="card-base p-5 opacity-0 animate-fade-in" style={{ animationDelay: "350ms" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4.5 h-4.5 text-warning" />
          <h3 className="text-sm font-semibold text-text-primary">Stockout Risk Monitor</h3>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-critical" /> {critical.length} Critical</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning" /> {high.length} High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-info" /> {medium.length} Medium</span>
        </div>
      </div>

      {/* Risk Items */}
      <div className="space-y-2.5">
        {topRisks.map((risk, i) => (
          <RiskRow key={risk.item.id} risk={risk} index={i} />
        ))}
      </div>

      {risks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-text-muted">
          <p className="text-sm">No stockout risks detected</p>
          <p className="text-xs mt-1">All items within safe stock levels</p>
        </div>
      )}
    </div>
  );
}

function RiskRow({ risk, index }: { risk: StockoutRisk; index: number }) {
  const colors = riskColors[risk.riskLevel];
  const maxDays = 5;
  const barWidth = Math.max(5, Math.min(100, ((maxDays - risk.daysUntilStockout) / maxDays) * 100));

  // Find branch name from branchId
  const branchMap: Record<string, string> = {
    "branch-hyd": "HYD",
    "branch-sdp": "SDP",
    "branch-wgl": "WGL",
  };

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-hover/50 hover:bg-surface-hover transition-colors opacity-0 animate-fade-in"
      style={{ animationDelay: `${index * 60 + 400}ms` }}
    >
      {/* Risk Level Dot */}
      <div className={cn("w-2 h-2 rounded-full shrink-0", colors.bg, risk.riskLevel === "critical" && "pulse-dot")} />

      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary truncate">{risk.item.name}</span>
          <span className="text-[10px] font-mono text-text-muted bg-surface px-1.5 py-0.5 rounded">{branchMap[risk.item.branchId]}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {/* Risk bar */}
          <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", colors.bar)}
              style={{ width: `${barWidth}%`, opacity: 0.7 }}
            />
          </div>
          <span className={cn("text-[11px] font-semibold shrink-0", colors.text)}>
            {risk.daysUntilStockout < 1 ? "<1d" : `${risk.daysUntilStockout.toFixed(1)}d`}
          </span>
        </div>
      </div>

      {/* Stock */}
      <div className="text-right shrink-0 hidden sm:block">
        <p className="text-xs text-text-secondary">{risk.item.currentStock} {risk.item.unit}</p>
        <p className="text-[10px] text-text-muted">of {risk.item.minStock} min</p>
      </div>
    </div>
  );
}
