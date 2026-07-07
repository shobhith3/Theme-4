"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { ChevronDown, Play, AlertCircle } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useState, useMemo } from "react";

export default function ForecastingPage() {
  const inventory = useStore(s => s.inventory);
  const branches = useStore(s => s.branches);

  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || "");
  const [selectedItemId, setSelectedItemId] = useState(inventory[0]?.id || "");
  const [range, setRange] = useState("14D");

  // Scenario state
  const [demandChange, setDemandChange] = useState(10);
  const [supplierDelay, setSupplierDelay] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [simResults, setSimResults] = useState<{ risk: string, daysCover: number } | null>(null);

  const selectedItem = useMemo(() => inventory.find(i => i.id === selectedItemId), [inventory, selectedItemId]);

  const handleRunScenario = () => {
    setIsRunning(true);
    setTimeout(() => {
      // Very basic mock simulation logic
      if (!selectedItem) {
        setIsRunning(false);
        return;
      }
      
      const baseDaysCover = selectedItem.avgDailyUsage > 0 ? selectedItem.currentStock / selectedItem.avgDailyUsage : 0;
      // Adjust days cover based on demand (if demand goes up by 50%, days cover drops significantly)
      const adjustedCover = baseDaysCover / (1 + demandChange / 100);
      
      // Delay impact
      let finalCover = adjustedCover - (supplierDelay * 0.2); // Just mock formula
      if (finalCover < 0) finalCover = 0;

      const risk = finalCover < (selectedItem.minStock / 10) ? 'Critical' : finalCover < 2 ? 'High' : 'Stable';

      setSimResults({ risk, daysCover: Number(finalCover.toFixed(1)) });
      setIsRunning(false);
    }, 600);
  };

  const currentDaysCover = selectedItem ? (selectedItem.avgDailyUsage > 0 ? (selectedItem.currentStock / selectedItem.avgDailyUsage).toFixed(1) : 'N/A') : 0;
  const itemStatus = selectedItem ? (selectedItem.currentStock <= selectedItem.minStock ? 'critical' : selectedItem.currentStock <= selectedItem.minStock * 1.5 ? 'warning' : 'healthy') : 'unknown';

  return (
    <PageContainer>
      <PageHeader 
        title="Forecast Studio" 
        description="Explore demand projections, confidence intervals, stock trajectories, and scenario risk." 
        actions={
          <>
            <div className="relative">
              <select
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                value={selectedItemId}
                onChange={(e) => {
                  setSelectedItemId(e.target.value);
                  setSimResults(null);
                }}
              >
                {inventory.filter(i => i.branchId === selectedBranchId).map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-border rounded-md text-[13px] font-medium text-text-primary hover:bg-surface-hover shadow-sm pointer-events-none">
                {selectedItem?.name || "Select Item"}
                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
              </button>
            </div>
            
            <div className="relative">
              <select
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                value={selectedBranchId}
                onChange={(e) => {
                  setSelectedBranchId(e.target.value);
                  const firstItem = inventory.find(i => i.branchId === e.target.value);
                  if (firstItem) setSelectedItemId(firstItem.id);
                  setSimResults(null);
                }}
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-border rounded-md text-[13px] font-medium text-text-primary hover:bg-surface-hover shadow-sm pointer-events-none">
                {branches.find(b => b.id === selectedBranchId)?.name || "Select Branch"}
                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
              </button>
            </div>

            <div className="flex bg-surface border border-border rounded-md overflow-hidden p-0.5 shadow-sm ml-2">
              <button onClick={() => setRange("7D")} className={`px-3 py-1 text-[12px] font-medium rounded ${range === '7D' ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>7D</button>
              <button onClick={() => setRange("14D")} className={`px-3 py-1 text-[12px] font-medium rounded ${range === '14D' ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>14D</button>
              <button onClick={() => setRange("30D")} className={`px-3 py-1 text-[12px] font-medium rounded ${range === '30D' ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>30D</button>
            </div>
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
        
        {/* Main Chart Area */}
        <div className="xl:col-span-8 flex flex-col bg-white border border-border rounded-[16px] p-[24px] shadow-sm min-h-[500px]">
          <h2 className="text-[16px] font-bold text-text-primary mb-6">Demand Projection vs. Inventory</h2>
          
          {/* Mock Chart Area */}
          <div className="flex-1 w-full bg-surface/50 border border-border/50 rounded-lg flex items-center justify-center relative overflow-hidden transition-all duration-500">
            {/* Decorative Mock Chart Elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute left-0 right-1/2 bottom-[20%] top-1/2 bg-blue-500/20 transition-all duration-1000" style={{ transform: simResults ? `translateY(${demandChange}px)` : 'none' }} />
              <div className="absolute left-1/2 right-0 bottom-0 top-[30%] bg-[var(--color-intelligence)]/20" />
            </div>
            
            <svg className="absolute inset-0 w-full h-full preserve-3d" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,70 L20,65 L40,68 L50,60 L60,40 L80,20 L100,5" fill="none" stroke="currentColor" className="text-text-primary transition-all duration-1000" strokeWidth="1" strokeDasharray="2" />
              <path d="M0,80 L20,75 L40,70 L50,65" fill="none" stroke="currentColor" className="text-text-secondary transition-all duration-1000" strokeWidth="2" style={{ transform: simResults ? `translateY(${supplierDelay * 2}px)` : 'none' }} />
              <path d={`M50,65 L60,${45 + demandChange/2} L80,${25 + demandChange/2} L100,${10 + demandChange/2}`} fill="none" stroke="currentColor" className="text-[var(--color-intelligence)] transition-all duration-1000" strokeWidth="2" />
            </svg>

            <div className="absolute bottom-1/4 left-0 right-0 border-t border-critical border-dashed opacity-50" />
            
            <div className="relative flex flex-col items-center bg-white p-3 rounded shadow-md border border-border text-center z-10 transition-all duration-500" style={{ opacity: simResults ? 1 : 0.8 }}>
              {simResults ? (
                <>
                  <span className={`text-[13px] font-bold ${simResults.risk === 'Critical' ? 'text-critical' : simResults.risk === 'High' ? 'text-warning' : 'text-text-primary'}`}>
                    Simulated Result: {simResults.risk} Risk
                  </span>
                  <span className="text-[11px] text-text-muted mt-1">{simResults.daysCover} days cover projected</span>
                </>
              ) : (
                <>
                  <span className="text-[13px] font-bold text-critical">Predicted Breach Point</span>
                  <span className="text-[11px] text-text-muted mt-1">Based on current trajectory</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Analysis Panel */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          <div className="bg-white border border-border rounded-[16px] p-[24px] shadow-sm">
            <h3 className="text-[15px] font-bold text-text-primary uppercase tracking-wider mb-4">Analysis: {selectedItem?.name}</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-text-secondary">Current Days Cover</span>
                <span className="text-[14px] font-bold text-text-primary">{currentDaysCover}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-text-secondary">Current Trend</span>
                <span className={`text-[14px] font-bold text-info`}>+5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-text-secondary">On Hand / Safety</span>
                <span className="text-[14px] font-bold text-text-primary">{selectedItem?.currentStock} / {selectedItem?.minStock} {selectedItem?.unit}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-text-secondary">Status</span>
                <span className={`text-[14px] font-bold capitalize ${itemStatus === 'critical' ? 'text-critical' : itemStatus === 'warning' ? 'text-warning' : 'text-info'}`}>{itemStatus}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface/50 border border-border rounded-[16px] p-[24px] shadow-sm flex-1">
            <h3 className="text-[15px] font-bold text-text-primary uppercase tracking-wider mb-4">Scenario Simulator</h3>
            
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-medium text-text-secondary">Demand Change: {demandChange}%</label>
                <input 
                  type="range" 
                  min="-20" 
                  max="50" 
                  value={demandChange} 
                  onChange={(e) => { setDemandChange(Number(e.target.value)); setSimResults(null); }}
                  className="w-full accent-[var(--color-intelligence)]" 
                />
                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>-20%</span>
                  <span>+50%</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-medium text-text-secondary">Supplier Delay: {supplierDelay} Days</label>
                <input 
                  type="range" 
                  min="0" 
                  max="5" 
                  value={supplierDelay} 
                  onChange={(e) => { setSupplierDelay(Number(e.target.value)); setSimResults(null); }}
                  className="w-full accent-amber-500" 
                />
                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>0</span>
                  <span>5</span>
                </div>
              </div>
              
              <button 
                onClick={handleRunScenario}
                disabled={isRunning}
                className="flex items-center justify-center gap-2 w-full h-[40px] bg-white border border-border rounded-[8px] text-[13px] font-semibold text-text-primary hover:bg-surface-hover transition-colors shadow-sm mt-2 disabled:opacity-50"
              >
                {isRunning ? (
                  <span className="animate-pulse">Simulating...</span>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-[var(--color-intelligence)]" />
                    Run Scenario
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </PageContainer>
  );
}
