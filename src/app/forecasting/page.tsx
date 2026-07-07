"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { ChevronDown, Play } from "lucide-react";

export default function ForecastingPage() {
  return (
    <PageContainer>
      <PageHeader 
        title="Forecast Studio" 
        description="Explore demand projections, confidence intervals, stock trajectories, and scenario risk." 
        actions={
          <>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-border rounded-md text-[13px] font-medium text-text-primary hover:bg-surface-hover shadow-sm">
              Chicken Breast
              <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-border rounded-md text-[13px] font-medium text-text-primary hover:bg-surface-hover shadow-sm">
              Hyderabad Central
              <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>
            <div className="flex bg-surface border border-border rounded-md overflow-hidden p-0.5 shadow-sm ml-2">
              <button className="px-3 py-1 text-[12px] font-medium text-text-secondary hover:text-text-primary rounded">7D</button>
              <button className="px-3 py-1 text-[12px] font-medium bg-white text-text-primary rounded shadow-sm">14D</button>
              <button className="px-3 py-1 text-[12px] font-medium text-text-secondary hover:text-text-primary rounded">30D</button>
            </div>
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
        
        {/* Main Chart Area */}
        <div className="xl:col-span-8 flex flex-col bg-white border border-border rounded-[16px] p-[24px] shadow-sm min-h-[500px]">
          <h2 className="text-[16px] font-bold text-text-primary mb-6">Demand Projection vs. Inventory</h2>
          
          {/* Mock Chart Area */}
          <div className="flex-1 w-full bg-surface/50 border border-border/50 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Decorative Mock Chart Elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute left-0 right-1/2 bottom-[20%] top-1/2 bg-blue-500/20" />
              <div className="absolute left-1/2 right-0 bottom-0 top-[30%] bg-[var(--color-intelligence)]/20" />
            </div>
            
            <svg className="absolute inset-0 w-full h-full preserve-3d" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,70 L20,65 L40,68 L50,60 L60,40 L80,20 L100,5" fill="none" stroke="currentColor" className="text-text-primary" strokeWidth="1" strokeDasharray="2" />
              <path d="M0,80 L20,75 L40,70 L50,65" fill="none" stroke="currentColor" className="text-text-secondary" strokeWidth="2" />
              <path d="M50,65 L60,45 L80,25 L100,10" fill="none" stroke="currentColor" className="text-[var(--color-intelligence)]" strokeWidth="2" />
            </svg>

            <div className="absolute bottom-1/4 left-0 right-0 border-t border-critical border-dashed opacity-50" />
            
            <div className="relative flex flex-col items-center bg-white p-3 rounded shadow-md border border-border text-center z-10">
              <span className="text-[13px] font-bold text-critical">Predicted Breach Point</span>
              <span className="text-[11px] text-text-muted mt-1">July 9, 14:00 (46 hours)</span>
            </div>
          </div>
        </div>

        {/* Right Analysis Panel */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          <div className="bg-white border border-border rounded-[16px] p-[24px] shadow-sm">
            <h3 className="text-[15px] font-bold text-text-primary uppercase tracking-wider mb-4">Analysis</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-text-secondary">Forecast confidence</span>
                <span className="text-[14px] font-bold text-text-primary">92%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-text-secondary">Weekend uplift</span>
                <span className="text-[14px] font-bold text-critical">+38%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-text-secondary">Recent trend</span>
                <span className="text-[14px] font-bold text-amber-600">+12%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-text-secondary">Supplier delay sensitivity</span>
                <span className="text-[14px] font-bold text-critical">High</span>
              </div>
            </div>
          </div>

          <div className="bg-surface/50 border border-border rounded-[16px] p-[24px] shadow-sm flex-1">
            <h3 className="text-[15px] font-bold text-text-primary uppercase tracking-wider mb-4">Scenario Simulator</h3>
            
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-medium text-text-secondary">Demand Change</label>
                <input type="range" min="-20" max="50" defaultValue="10" className="w-full accent-[var(--color-intelligence)]" />
                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>-20%</span>
                  <span>+50%</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-medium text-text-secondary">Supplier Delay (Days)</label>
                <input type="range" min="0" max="5" defaultValue="1" className="w-full accent-amber-500" />
                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>0</span>
                  <span>5</span>
                </div>
              </div>
              
              <button className="flex items-center justify-center gap-2 w-full h-[40px] bg-white border border-border rounded-[8px] text-[13px] font-semibold text-text-primary hover:bg-surface-hover transition-colors shadow-sm mt-2">
                <Play className="w-4 h-4 text-[var(--color-intelligence)]" />
                Run Scenario
              </button>
            </div>
          </div>

        </div>

      </div>
    </PageContainer>
  );
}
