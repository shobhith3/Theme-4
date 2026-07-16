"use client";

import { CheckCircle2, TrendingUp, ShieldCheck } from "lucide-react";

export function OutcomeTrackingCard() {
  return (
    <div className="bg-[#F6FAF8] rounded-xl border border-[#E4EDE8] p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-success" />
          Recommendation Outcome
        </h3>
        <span className="text-[11px] font-[700] text-success bg-success-muted px-2 py-0.5 rounded-md uppercase tracking-wider border border-success/20">
          Validated
        </span>
      </div>
      
      <p className="text-[13px] text-text-secondary mb-5 leading-relaxed">
        Past decisions are continuously monitored. Here is the outcome of a recent <strong className="text-text-primary font-medium">Hybrid Replenishment</strong> for Chicken Breast.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4 border-b border-[#E4EDE8] pb-4">
        <div>
          <div className="text-[11px] font-[650] text-text-muted uppercase tracking-wider">Predicted Demand</div>
          <div className="text-[16px] font-medium text-text-primary mt-1">38 kg</div>
        </div>
        <div>
          <div className="text-[11px] font-[650] text-text-muted uppercase tracking-wider">Actual Demand</div>
          <div className="text-[16px] font-bold text-text-primary mt-1 flex items-center gap-2">
            36.5 kg
            <span className="text-[11px] font-bold bg-white border border-[#E4EDE8] text-success px-1.5 py-0.5 rounded shadow-sm">
              96% Accuracy
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1 justify-end">
        <div className="flex items-center gap-2 text-[13px] font-medium text-text-primary">
          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
          Stockout successfully avoided during peak weekend.
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-text-primary">
          <TrendingUp className="w-4 h-4 text-success shrink-0" />
          ₹31,410 revenue protected with zero emergency sourcing fees.
        </div>
      </div>
    </div>
  );
}
