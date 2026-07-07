"use client";

import { PageContainer } from "@/components/common/page-container";
import { PrimaryDecisionCard } from "@/components/dashboard/primary-decision-card";
import { DecisionReasoningCard } from "@/components/dashboard/decision-reasoning-card";
import { DecisionQueue } from "@/components/dashboard/decision-queue";
import { MetricStrip } from "@/components/dashboard/metric-strip";
import { RiskOutlook } from "@/components/dashboard/risk-outlook";
import { ChevronDown } from "lucide-react";

export default function CommandCenterPage() {
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
            <button className="flex items-center gap-2 px-3 h-[34px] bg-surface border border-border rounded-md text-[13px] font-medium text-text-primary hover:border-border-strong transition-colors shadow-sm">
              All Branches
              <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>
            <button className="flex items-center gap-2 px-3 h-[34px] bg-surface border border-border rounded-md text-[13px] font-medium text-text-primary hover:border-border-strong transition-colors shadow-sm">
              Today
              <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>
          </div>
          <div className="flex items-center gap-1.5 pr-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-intelligence)] animate-pulse" />
            <span className="text-[11px] font-medium text-text-muted">Updated 4 min ago</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Executive Intelligence Brief */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full mb-9 items-start">
        <div className="xl:col-span-2 min-w-0">
          <PrimaryDecisionCard />
        </div>
        <div className="xl:col-span-1 min-w-0">
          <DecisionReasoningCard />
        </div>
      </div>

      {/* SECTION 3: Decision Queue */}
      <div className="mb-8">
        <DecisionQueue />
      </div>

      {/* SECTION 4: Network Pulse Metrics */}
      <div className="mb-8">
        <MetricStrip />
      </div>

      {/* SECTION 5: Risk & Opportunity Outlook */}
      <div>
        <RiskOutlook />
      </div>

    </PageContainer>
  );
}
