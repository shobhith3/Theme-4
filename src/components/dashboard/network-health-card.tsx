"use client";

import { Activity } from "lucide-react";

const branches = [
  { name: "Hyderabad Central", score: 78, status: "Attention", color: "bg-warning" },
  { name: "Siddipet Main", score: 91, status: "Healthy", color: "bg-success" },
  { name: "Warangal", score: 84, status: "Stable", color: "bg-success" },
];

export function NetworkHealthCard() {
  return (
    <div className="card-base bg-surface-elevated p-6 md:p-8 flex flex-col h-full min-h-[280px]">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[15px] font-semibold text-text-primary">Network Health</h3>
        <div className="flex items-center gap-2 px-2.5 py-1 bg-surface rounded-full border border-border">
          <Activity className="w-3.5 h-3.5 text-text-secondary" />
          <span className="text-[11px] font-medium text-text-primary">Score: 84</span>
        </div>
      </div>

      <div className="flex flex-col gap-6 flex-1 justify-center">
        {branches.map((branch) => (
          <div key={branch.name} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-text-primary">{branch.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold tabular-nums text-text-primary">{branch.score}</span>
                <span className="text-[11px] text-text-muted w-14 text-right">{branch.status}</span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
              <div 
                className={`h-full ${branch.color} rounded-full transition-all duration-1000`}
                style={{ width: `${branch.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
