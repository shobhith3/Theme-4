"use client";

import { PageContainer } from "@/components/common/page-container";
import { PrimaryDecisionCard } from "@/components/dashboard/primary-decision-card";
import { DecisionReasoningCard } from "@/components/dashboard/decision-reasoning-card";
import { DecisionQueue } from "@/components/dashboard/decision-queue";
import { MetricStrip } from "@/components/dashboard/metric-strip";
import { RiskOutlook } from "@/components/dashboard/risk-outlook";
import { ChevronDown, ChevronRight, Activity } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useState } from "react";
import { GuidedDecisionReview } from "@/components/decision/guided-decision-review";

export default function CommandCenterPage() {
  const [selectedBranch, setSelectedBranch] = useState<string | "all">("all");
  const [isAdvancedView, setIsAdvancedView] = useState(false);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);
  
  const branches = useStore((s) => s.branches);
  const settings = useStore((s) => s.settings);

  const branchId = selectedBranch === "all" ? undefined : selectedBranch;

  return (
    <PageContainer className="pt-0">
      
      {/* SECTION 1: Page Header */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] items-end gap-6 mb-7">
        <div className="flex flex-col">
          <p className="text-[11px] font-[650] text-text-muted uppercase tracking-[0.08em] mb-1.5">
            COMMAND CENTER
          </p>
          <h1 className="text-[28px] md:text-[34px] lg:text-[36px] font-[700] text-text-primary leading-[1.05] m-0">
            Good evening, Sanjay.
          </h1>
          <p className="text-[15px] text-text-secondary mt-1.5 md:mt-2 leading-relaxed">
            Three decisions require attention before tomorrow&apos;s supplier cutoff.
          </p>
        </div>
        
        <div className="flex flex-col md:items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="all">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <button className="flex items-center gap-2 px-3 h-[34px] bg-surface border border-border rounded-md text-[13px] font-medium text-text-primary hover:border-border-strong transition-colors shadow-sm pointer-events-none">
                {selectedBranch === "all" ? "All Branches" : branches.find(b => b.id === selectedBranch)?.name || "All Branches"}
                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
              </button>
            </div>
            <button className="flex items-center gap-2 px-3 h-[34px] bg-surface border border-border rounded-md text-[13px] font-medium text-text-primary hover:border-border-strong transition-colors shadow-sm">
              Today
              <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>
          </div>
          <div className="flex items-center gap-1.5 pr-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-intelligence)] animate-pulse" />
            <span className="text-[11px] font-medium text-text-muted">Updated just now</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Executive Intelligence Brief */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full mb-9 items-start">
        <div className="xl:col-span-2 min-w-0">
          <PrimaryDecisionCard 
            branchId={branchId} 
            onReviewDecision={(id) => setSelectedDecisionId(id)} 
          />
        </div>
        <div className="xl:col-span-1 min-w-0">
          <DecisionReasoningCard branchId={branchId} />
        </div>
      </div>

      {/* Advanced View Toggle */}
      <div className="flex items-center justify-center mb-8 border-t border-border pt-6">
        <button
          onClick={() => setIsAdvancedView(!isAdvancedView)}
          className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover border border-border rounded-full text-[13px] font-medium text-text-secondary transition-colors"
        >
          <Activity className="w-4 h-4" />
          {isAdvancedView ? "Hide full analysis" : "View full analysis"}
          <ChevronDown className={`w-4 h-4 transition-transform ${isAdvancedView ? "rotate-180" : ""}`} />
        </button>
      </div>

      {isAdvancedView && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          {/* SECTION 3: Decision Queue */}
          <div className="mb-8">
            <DecisionQueue branchId={branchId} />
          </div>

          {/* SECTION 4: Network Pulse Metrics */}
          <div className="mb-8">
            <MetricStrip branchId={branchId} />
          </div>

          {/* SECTION 5: Risk & Opportunity Outlook */}
          <div>
            <RiskOutlook branchId={branchId} />
          </div>
        </div>
      )}

      {/* Modals */}
      <GuidedDecisionReview 
        isOpen={!!selectedDecisionId}
        onClose={() => setSelectedDecisionId(null)}
        decisionId={selectedDecisionId}
      />
    </PageContainer>
  );
}
