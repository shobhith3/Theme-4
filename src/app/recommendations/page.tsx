"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { ConfidenceBadge } from "@/components/common/confidence-badge";
import { StatusBadge } from "@/components/common/status-badge";
import { mockDecisions } from "@/lib/mock-data";

export default function RecommendationsPage() {
  return (
    <PageContainer>
      <PageHeader 
        title="Decision Center" 
        description="Review AI-generated procurement strategies ranked by urgency and business impact." 
      />

      <div className="flex items-center gap-6 border-b border-border mb-6">
        <button className="pb-3 text-[14px] font-bold text-text-primary border-b-2 border-[var(--color-intelligence)]">
          Needs Attention
        </button>
        <button className="pb-3 text-[14px] font-medium text-text-secondary hover:text-text-primary transition-colors border-b-2 border-transparent">
          Approved
        </button>
        <button className="pb-3 text-[14px] font-medium text-text-secondary hover:text-text-primary transition-colors border-b-2 border-transparent">
          Rejected
        </button>
        <button className="pb-3 text-[14px] font-medium text-text-secondary hover:text-text-primary transition-colors border-b-2 border-transparent">
          Completed
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Decision List */}
        <div className="flex flex-col gap-4 w-full lg:w-1/2 xl:w-2/5">
          {mockDecisions.map((decision, i) => (
            <div 
              key={decision.id}
              className={`flex flex-col p-[20px] bg-white border rounded-[12px] cursor-pointer transition-colors ${i === 0 ? 'border-[var(--color-intelligence)] shadow-sm' : 'border-border shadow-sm hover:border-border-strong'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <StatusBadge status={decision.status} />
                <span className="text-[12px] font-medium text-text-muted">{decision.timeToBreach}</span>
              </div>
              
              <h3 className="text-[18px] font-bold text-text-primary mb-1">{decision.item}</h3>
              <span className="text-[13px] text-text-secondary mb-4">{decision.branch}</span>
              
              <div className="flex items-center justify-between pt-4 border-t border-border/60">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">Impact</span>
                  <span className="text-[14px] font-bold text-text-primary tabular-nums">₹{decision.netProtection.toLocaleString()}</span>
                </div>
                <ConfidenceBadge score={decision.confidence} />
              </div>
            </div>
          ))}
        </div>

        {/* Active Decision Detail */}
        <div className="flex flex-col w-full lg:w-1/2 xl:w-3/5 bg-white border border-border rounded-[16px] shadow-sm overflow-hidden h-fit">
          <div className="p-[24px] border-b border-border">
            <h2 className="text-[24px] font-bold text-text-primary mb-2">Chicken Breast — Hyderabad Central</h2>
            <p className="text-[14px] text-text-secondary">Projected to breach safety stock in 46 hours. 3 strategies available.</p>
          </div>
          
          <div className="flex flex-col bg-surface/30 p-[24px] gap-6">
            
            {/* Strategy Option A */}
            <div className="flex flex-col bg-white border border-[var(--color-intelligence)] rounded-[12px] p-[20px] shadow-sm relative">
              <div className="absolute top-0 right-0 bg-[var(--color-intelligence)] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-bl-[12px] rounded-tr-[11px]">
                AI Recommended
              </div>
              <h3 className="text-[16px] font-bold text-text-primary mb-4">Option C: Hybrid Replenishment</h3>
              
              <div className="grid grid-cols-2 gap-y-4 mb-4">
                <div>
                  <span className="block text-[11px] font-semibold text-text-muted uppercase mb-1">Actions</span>
                  <span className="block text-[13px] font-medium text-text-primary">Transfer 18 kg (Warangal)</span>
                  <span className="block text-[13px] font-medium text-text-primary">Purchase 22 kg (FreshRoute)</span>
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-text-muted uppercase mb-1">Net Financial Impact</span>
                  <span className="block text-[14px] font-bold text-text-primary">₹31,410</span>
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                <button className="flex-1 h-[40px] bg-[var(--color-sidebar-bg)] text-white rounded-[8px] text-[13px] font-medium hover:bg-black transition-colors">
                  Approve Strategy
                </button>
                <button className="h-[40px] px-[16px] bg-white border border-border rounded-[8px] text-[13px] font-medium text-text-primary hover:bg-surface-hover transition-colors">
                  Modify
                </button>
              </div>
            </div>

            {/* Strategy Option B */}
            <div className="flex flex-col bg-white border border-border rounded-[12px] p-[20px]">
              <h3 className="text-[16px] font-bold text-text-primary mb-4">Option B: Inter-branch Transfer Only</h3>
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <span className="block text-[11px] font-semibold text-text-muted uppercase mb-1">Actions</span>
                  <span className="block text-[13px] font-medium text-text-primary">Transfer 18 kg (Warangal)</span>
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-text-muted uppercase mb-1">Risk</span>
                  <span className="block text-[13px] font-bold text-critical">12kg Shortfall Projected</span>
                </div>
              </div>
            </div>
            
            {/* Strategy Option C */}
            <div className="flex flex-col bg-white border border-border rounded-[12px] p-[20px]">
              <h3 className="text-[16px] font-bold text-text-primary mb-4">Option A: Full Purchase</h3>
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <span className="block text-[11px] font-semibold text-text-muted uppercase mb-1">Actions</span>
                  <span className="block text-[13px] font-medium text-text-primary">Purchase 40 kg (Metro Wholesale)</span>
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-text-muted uppercase mb-1">Risk</span>
                  <span className="block text-[13px] font-bold text-amber-600">Overstock Risk (14 days cover)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PageContainer>
  );
}
