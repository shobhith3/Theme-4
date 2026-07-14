"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { ChevronDown, Play, AlertCircle, HelpCircle, ArrowRight } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useState, useMemo } from "react";
import Link from "next/link";

export default function ForecastingPage() {
  const inventory = useStore(s => s.inventory);
  const branches = useStore(s => s.branches);
  const recommendations = useStore(s => s.recommendations);

  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || "");
  const [selectedItemId, setSelectedItemId] = useState(inventory[0]?.id || "");
  const [range, setRange] = useState("14D");

  // Scenario state
  const [demandChange, setDemandChange] = useState(10);
  const [supplierDelay, setSupplierDelay] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [simResults, setSimResults] = useState<{ risk: string; daysCover: number; reason: string; action: string } | null>(null);

  const selectedItem = useMemo(() => inventory.find(i => i.id === selectedItemId), [inventory, selectedItemId]);

  // Find a matching recommendation for the "Review Decision" button
  const matchingRec = useMemo(() => {
    if (!selectedItem) return null;
    return recommendations.find(r => r.itemId === selectedItem.id && r.branchId === selectedItem.branchId && r.status === "pending");
  }, [selectedItem, recommendations]);

  const handleRunScenario = () => {
    setIsRunning(true);
    setTimeout(() => {
      if (!selectedItem) {
        setIsRunning(false);
        return;
      }

      const baseDaysCover = selectedItem.avgDailyUsage > 0 ? selectedItem.currentStock / selectedItem.avgDailyUsage : 0;
      const adjustedCover = baseDaysCover / (1 + demandChange / 100);
      let finalCover = adjustedCover - (supplierDelay * 0.2);
      if (finalCover < 0) finalCover = 0;

      const risk = finalCover < (selectedItem.minStock / 10) ? "Critical" : finalCover < 2 ? "High" : "Stable";

      // Build a plain-language reason
      let reason = "";
      if (demandChange > 0 && supplierDelay > 0) {
        reason = `A ${demandChange}% demand increase combined with a ${supplierDelay}-day supplier delay significantly reduces the stock buffer.`;
      } else if (demandChange > 0) {
        reason = `A ${demandChange}% demand increase means stock will be consumed faster than expected.`;
      } else if (supplierDelay > 0) {
        reason = `A ${supplierDelay}-day supplier delay means replenishment arrives later, increasing stockout risk.`;
      } else {
        reason = "Under current conditions, stock levels remain within acceptable range.";
      }

      const action = risk === "Critical" || risk === "High"
        ? "Review the replenishment decision."
        : "No immediate action required. Continue monitoring.";

      setSimResults({ risk, daysCover: Number(finalCover.toFixed(1)), reason, action });
      setIsRunning(false);
    }, 600);
  };

  const currentDaysCover = selectedItem ? (selectedItem.avgDailyUsage > 0 ? (selectedItem.currentStock / selectedItem.avgDailyUsage).toFixed(1) : "N/A") : "0";
  const itemStatus = selectedItem ? (selectedItem.currentStock <= selectedItem.minStock ? "critical" : selectedItem.currentStock <= selectedItem.minStock * 1.5 ? "warning" : "healthy") : "unknown";

  const rangeDays = range === "7D" ? 7 : range === "14D" ? 14 : 30;

  return (
    <PageContainer>
      <PageHeader
        title="Forecast Studio"
        description="Understand stock risk, expected demand, and what action to take next."
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

        {/* ============ CHART CARD ============ */}
        <div className="xl:col-span-8 flex flex-col bg-white border border-border rounded-[16px] p-[24px] shadow-sm min-h-[500px]">

          {/* Chart Title + Description */}
          <div className="mb-2">
            <h2 className="text-[17px] font-bold text-text-primary">
              Will {selectedItem?.name || "this item"} stock last?
            </h2>
            <p className="text-[13px] text-text-secondary mt-1 leading-relaxed max-w-[600px]">
              This forecast compares expected demand, available stock, and safety stock to show when the item may become risky.
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4 pb-3 border-b border-border/50">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-[3px] rounded bg-text-muted" />
              <span className="text-[11px] font-medium text-text-secondary">Actual inventory</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-[3px] rounded border-b-2 border-dashed border-text-primary bg-transparent" />
              <span className="text-[11px] font-medium text-text-secondary">Predicted demand</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-[3px] rounded bg-[var(--color-intelligence)]" />
              <span className="text-[11px] font-medium text-text-secondary">Projected inventory</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-0 border-t-2 border-dashed border-critical" />
              <span className="text-[11px] font-medium text-text-secondary">Safety stock level</span>
            </div>
            {simResults && (
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-[11px] font-medium text-text-secondary">Scenario result</span>
              </div>
            )}
          </div>

          {/* Chart Area */}
          <div className="flex-1 w-full relative overflow-hidden transition-all duration-500">

            {/* Y-axis label */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[10px] font-medium text-text-muted tracking-wider uppercase select-none whitespace-nowrap z-20" style={{ transform: 'translateX(-14px) translateY(-50%) rotate(-90deg)' }}>
              Quantity in {selectedItem?.unit || "kg"}
            </div>

            {/* Chart body */}
            <div className="ml-6 mr-2 h-full bg-surface/50 border border-border/50 rounded-lg flex items-center justify-center relative overflow-hidden">

              {/* Subtle background fills */}
              <div className="absolute inset-0 opacity-15">
                <div className="absolute left-0 right-1/2 bottom-[20%] top-1/2 bg-blue-500/20 transition-all duration-1000" style={{ transform: simResults ? `translateY(${demandChange}px)` : "none" }} />
                <div className="absolute left-1/2 right-0 bottom-0 top-[30%] bg-[var(--color-intelligence)]/20" />
              </div>

              {/* SVG Lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Actual inventory (grey solid) */}
                <path
                  d="M0,80 L20,75 L40,70 L50,65"
                  fill="none"
                  stroke="currentColor"
                  className="text-text-muted/60 transition-all duration-1000"
                  strokeWidth="2.5"
                  style={{ transform: simResults ? `translateY(${supplierDelay * 2}px)` : "none" }}
                />

                {/* Predicted demand (dark dashed) */}
                <path
                  d="M0,70 L20,65 L40,68 L50,60 L60,40 L80,20 L100,5"
                  fill="none"
                  stroke="currentColor"
                  className="text-text-primary/50 transition-all duration-1000"
                  strokeWidth="1"
                  strokeDasharray="3 2"
                />

                {/* Projected inventory (accent solid) */}
                <path
                  d={`M50,65 L60,${45 + demandChange / 2} L80,${25 + demandChange / 2} L100,${10 + demandChange / 2}`}
                  fill="none"
                  stroke="currentColor"
                  className="text-[var(--color-intelligence)] transition-all duration-1000"
                  strokeWidth="2.5"
                />
              </svg>

              {/* Safety stock line (red dashed horizontal) */}
              <div className="absolute bottom-1/4 left-0 right-0 border-t-2 border-critical border-dashed opacity-50" />

              {/* Scenario marker dot */}
              {simResults && (
                <div className="absolute z-10 transition-all duration-500" style={{ right: "10%", top: `${10 + demandChange / 2}%` }}>
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-md animate-pulse" />
                </div>
              )}

              {/* Breach label on chart */}
              <div className="relative flex flex-col items-center bg-white p-3 rounded shadow-md border border-border text-center z-10 transition-all duration-500" style={{ opacity: simResults ? 1 : 0.8 }}>
                {simResults ? (
                  <>
                    <span className={`text-[13px] font-bold ${simResults.risk === "Critical" ? "text-critical" : simResults.risk === "High" ? "text-warning" : "text-text-primary"}`}>
                      Scenario: {simResults.risk} Risk
                    </span>
                    <span className="text-[11px] text-text-muted mt-1">{simResults.daysCover} days of stock cover</span>
                  </>
                ) : (
                  <>
                    <span className="text-[13px] font-bold text-critical">Stock risk detected</span>
                    <span className="text-[11px] text-text-muted mt-1">Based on current demand trend</span>
                  </>
                )}
              </div>
            </div>

            {/* X-axis label */}
            <div className="text-center mt-2.5 text-[10px] font-medium text-text-muted uppercase tracking-wider select-none">
              Next {rangeDays} days
            </div>
          </div>

          {/* How to read this */}
          <div className="flex items-start gap-2.5 mt-5 pt-4 border-t border-border/50">
            <HelpCircle className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
            <p className="text-[12px] text-text-secondary leading-relaxed">
              <span className="font-semibold text-text-primary">How to read this: </span>
              If projected inventory falls below the safety stock line, the item needs attention. The scenario simulator shows how risk changes when demand increases or supplier delivery is delayed.
            </p>
          </div>
        </div>

        {/* ============ RIGHT PANEL ============ */}
        <div className="xl:col-span-4 flex flex-col gap-6">

          {/* ---- ANALYSIS CARD ---- */}
          <div className="bg-white border border-border rounded-[16px] p-[24px] shadow-sm">
            <h3 className="text-[15px] font-bold text-text-primary mb-4">Analysis: {selectedItem?.name}</h3>
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-text-secondary">Stock cover</span>
                <span className="text-[14px] font-bold text-text-primary">{currentDaysCover} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-text-secondary">Demand trend</span>
                <span className="text-[14px] font-bold text-info">+5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-text-secondary">Current stock / Safety stock</span>
                <span className="text-[14px] font-bold text-text-primary">{selectedItem?.currentStock} / {selectedItem?.minStock} {selectedItem?.unit}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-text-secondary">Risk status</span>
                <span className={`text-[14px] font-bold capitalize ${itemStatus === "critical" ? "text-critical" : itemStatus === "warning" ? "text-warning" : "text-info"}`}>{itemStatus}</span>
              </div>
            </div>

            {/* Plain-language interpretation */}
            <div className="mt-4 pt-3.5 border-t border-border/50">
              <div className="flex items-start gap-2 p-3 bg-surface rounded-lg border border-border/50">
                <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${itemStatus === "critical" ? "text-critical" : itemStatus === "warning" ? "text-warning" : "text-info"}`} />
                <p className="text-[12px] text-text-secondary leading-relaxed">
                  {itemStatus === "critical" ? (
                    <>Current stock can cover only <span className="font-semibold text-text-primary">{currentDaysCover} days</span> of expected demand. Stock is below the <span className="font-semibold text-text-primary">{selectedItem?.minStock} {selectedItem?.unit}</span> safety threshold, so action is required.</>
                  ) : itemStatus === "warning" ? (
                    <>Stock cover is low at <span className="font-semibold text-text-primary">{currentDaysCover} days</span>. Stock is close to the safety threshold of <span className="font-semibold text-text-primary">{selectedItem?.minStock} {selectedItem?.unit}</span>. Monitor closely.</>
                  ) : (
                    <>Stock levels are healthy with <span className="font-semibold text-text-primary">{currentDaysCover} days</span> of cover. No immediate action needed.</>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* ---- SCENARIO SIMULATOR CARD ---- */}
          <div className="bg-surface/50 border border-border rounded-[16px] p-[24px] shadow-sm flex-1 flex flex-col">
            <h3 className="text-[15px] font-bold text-text-primary mb-1">Scenario Simulator</h3>
            <p className="text-[12px] text-text-secondary mb-5 leading-relaxed">
              Test how demand increase or supplier delay affects stock risk.
            </p>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-medium text-text-secondary">Demand change: <span className="text-text-primary font-semibold">{demandChange > 0 ? "+" : ""}{demandChange}%</span></label>
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
                <label className="text-[12px] font-medium text-text-secondary">Supplier delay: <span className="text-text-primary font-semibold">{supplierDelay} {supplierDelay === 1 ? "day" : "days"}</span></label>
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
                  <span>5 days</span>
                </div>
              </div>

              <button
                onClick={handleRunScenario}
                disabled={isRunning}
                className="flex items-center justify-center gap-2 w-full h-[40px] bg-white border border-border rounded-[8px] text-[13px] font-semibold text-text-primary hover:bg-surface-hover transition-colors shadow-sm mt-1 disabled:opacity-50"
              >
                {isRunning ? (
                  <span className="animate-pulse">Simulating…</span>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-[var(--color-intelligence)]" />
                    Run Scenario
                  </>
                )}
              </button>
            </div>

            {/* ---- SCENARIO RESULT PANEL ---- */}
            {simResults && (
              <div className="mt-5 pt-4 border-t border-border/60 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className={`p-4 rounded-xl border ${simResults.risk === "Critical" ? "bg-critical/5 border-critical/20" : simResults.risk === "High" ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>

                  {/* Risk badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Scenario Result</span>
                    <span className={`text-[12px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${simResults.risk === "Critical" ? "bg-critical/10 text-critical" : simResults.risk === "High" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                      {simResults.risk} Risk
                    </span>
                  </div>

                  {/* Projected cover */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] text-text-secondary">Projected cover</span>
                    <span className="text-[15px] font-bold text-text-primary">{simResults.daysCover} days</span>
                  </div>

                  {/* Why */}
                  <div className="mb-3">
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">Why</span>
                    <p className="text-[12px] text-text-secondary leading-relaxed">{simResults.reason}</p>
                  </div>

                  {/* Recommended next step */}
                  <div className="mb-3">
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">Recommended next step</span>
                    <p className="text-[13px] font-medium text-text-primary">{simResults.action}</p>
                  </div>

                  {/* Review Decision button */}
                  {(simResults.risk === "Critical" || simResults.risk === "High") && matchingRec && (
                    <Link
                      href={`/recommendations?id=${matchingRec.id}`}
                      className="flex items-center justify-center gap-2 w-full h-[38px] bg-[var(--color-accent)] text-white rounded-lg text-[13px] font-semibold hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm mt-1"
                    >
                      Review Decision
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </PageContainer>
  );
}
