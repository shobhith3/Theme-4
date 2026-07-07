"use client";

import { ArrowRight, AlertCircle } from "lucide-react";

export function DecisionBrief() {
  return (
    <div className="card-base bg-surface p-6 md:p-8 flex flex-col justify-between h-full min-h-[280px]">
      <div>
        <p className="text-[13px] font-semibold text-accent uppercase tracking-widest mb-4">
          Today&apos;s Decision Brief
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight leading-tight max-w-2xl mb-4">
          <span className="tabular-nums">₹84,200</span> in preventable revenue is currently at risk.
        </h2>
        <p className="text-[15px] text-text-secondary max-w-xl leading-relaxed">
          3 critical decisions require attention before tomorrow&apos;s supplier cutoff.
        </p>
        
        <div className="mt-6 flex items-start gap-3 bg-critical-muted/50 p-4 rounded-lg border border-critical-muted max-w-xl">
          <AlertCircle className="w-5 h-5 text-critical shrink-0 mt-0.5" />
          <p className="text-[13px] text-text-primary leading-relaxed">
            <span className="font-semibold">Most immediate risk:</span> Chicken Breast at Hyderabad Central is projected to breach safety stock within 46 hours.
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-md font-medium transition-all shadow-sm">
          Review 3 Critical Decisions
          <ArrowRight className="w-4 h-4" />
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-surface hover:bg-background border border-border text-text-primary rounded-md font-medium transition-all">
          View Network Risks
        </button>
      </div>
    </div>
  );
}
