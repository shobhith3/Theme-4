"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import {
  ChevronDown, Play, HelpCircle, ArrowRight, Eye,
  ShieldAlert, TrendingUp, Package, Clock, Truck,
  AlertTriangle
} from "lucide-react";
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

  const [demandChange, setDemandChange] = useState(10);
  const [supplierDelay, setSupplierDelay] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [simResults, setSimResults] = useState<{
    risk: string; daysCover: number; reason: string;
    riskChange: string; action: string;
  } | null>(null);

  const selectedItem = useMemo(() => inventory.find(i => i.id === selectedItemId), [inventory, selectedItemId]);
  const selectedBranch = useMemo(() => branches.find(b => b.id === selectedBranchId), [branches, selectedBranchId]);

  const matchingRec = useMemo(() => {
    if (!selectedItem) return null;
    return recommendations.find(r => r.itemId === selectedItem.id && r.branchId === selectedItem.branchId && r.status === "pending");
  }, [selectedItem, recommendations]);

  // ── Computed values ──
  const currentDaysCover = selectedItem
    ? (selectedItem.avgDailyUsage > 0 ? (selectedItem.currentStock / selectedItem.avgDailyUsage).toFixed(1) : "N/A")
    : "0";

  const itemStatus = selectedItem
    ? (selectedItem.currentStock <= selectedItem.minStock ? "critical"
      : selectedItem.currentStock <= selectedItem.minStock * 1.5 ? "warning"
      : "healthy")
    : "unknown";

  const statusLabel = itemStatus === "critical" ? "Critical" : itemStatus === "warning" ? "Warning" : "Healthy";
  const statusColor = itemStatus === "critical" ? "text-critical" : itemStatus === "warning" ? "text-warning" : "text-info";

  const rangeDays = range === "7D" ? 7 : range === "14D" ? 14 : 30;

  // ── Banner text ──
  const bannerTitle = useMemo(() => {
    if (!selectedItem) return "";
    if (itemStatus === "critical") return `${selectedItem.name} is below the safe stock level.`;
    if (itemStatus === "warning") return `${selectedItem.name} stock is getting low.`;
    return `${selectedItem.name} stock levels are healthy.`;
  }, [selectedItem, itemStatus]);

  const bannerSubtitle = useMemo(() => {
    if (!selectedItem || !selectedBranch) return "";
    if (itemStatus === "critical") {
      return `${selectedBranch.name} currently has ${selectedItem.currentStock} ${selectedItem.unit} on hand against a ${selectedItem.minStock} ${selectedItem.unit} safety level. Current stock can cover only ${currentDaysCover} days of expected demand.`;
    }
    if (itemStatus === "warning") {
      return `${selectedBranch.name} has ${selectedItem.currentStock} ${selectedItem.unit} on hand, approaching the ${selectedItem.minStock} ${selectedItem.unit} safety level. Monitor closely.`;
    }
    return `${selectedBranch.name} has ${selectedItem.currentStock} ${selectedItem.unit} on hand, well above the ${selectedItem.minStock} ${selectedItem.unit} safety level.`;
  }, [selectedItem, selectedBranch, itemStatus, currentDaysCover]);

  // ── Recommended action data ──
  const recStrategy = matchingRec?.type === "hybrid" ? "Hybrid Replenishment"
    : matchingRec?.type === "transfer" ? "Inter-Branch Transfer"
    : matchingRec?.type === "procure" ? "Purchase Order"
    : matchingRec?.type === "reduce" ? "Stock Reduction" : null;

  // ── Scenario handler ──
  const handleRunScenario = () => {
    setIsRunning(true);
    setTimeout(() => {
      if (!selectedItem) { setIsRunning(false); return; }

      const baseDaysCover = selectedItem.avgDailyUsage > 0 ? selectedItem.currentStock / selectedItem.avgDailyUsage : 0;
      // Deterministic simulation
      const adjustedCover = baseDaysCover / (1 + demandChange / 100);
      let finalCover = adjustedCover - (supplierDelay * 0.2);
      if (finalCover < 0) finalCover = 0;

      const risk = finalCover < (selectedItem.minStock / 10) ? "Critical" : finalCover < 2 ? "High" : "Stable";

      let reason = "";
      if (demandChange > 0 && supplierDelay > 0) {
        reason = `Higher demand and supplier delay reduce the available stock buffer.`;
      } else if (demandChange > 0) {
        reason = `Higher demand reduces the available stock buffer.`;
      } else if (demandChange < 0 && supplierDelay > 0) {
        reason = `Supplier delay adds risk despite lower demand.`;
      } else if (supplierDelay > 0) {
        reason = `Supplier delay reduces the available stock buffer.`;
      } else if (demandChange < 0) {
        reason = `Lower demand increases the available stock buffer.`;
      } else {
        reason = `Under current conditions, the available stock buffer remains unchanged.`;
      }

      const riskChange = finalCover < baseDaysCover ? "Worse than baseline" : finalCover > baseDaysCover ? "Better than baseline" : "Same as baseline";

      const action = risk === "Critical" || risk === "High"
        ? "Review replenishment decision"
        : "No immediate action required";

      setSimResults({ risk, daysCover: Number(finalCover.toFixed(1)), reason, riskChange, action });
      setIsRunning(false);
    }, 600);
  };

  return (
    <PageContainer>
      {/* ═══════ SECTION 1 — PAGE HEADER ═══════ */}
      <PageHeader
        title="Forecast Studio"
        description="Understand whether current stock can meet upcoming demand and how delays or demand changes affect risk."
        actions={
          <>
            {/* Item selector */}
            <div className="relative">
              <select
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                value={selectedItemId}
                onChange={(e) => { setSelectedItemId(e.target.value); setSimResults(null); }}
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

            {/* Branch selector */}
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
                {selectedBranch?.name || "Select Branch"}
                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
              </button>
            </div>

            {/* Range selector */}
            <div className="flex bg-surface border border-border rounded-md overflow-hidden p-0.5 shadow-sm ml-1">
              {(["7D", "14D", "30D"] as const).map(r => (
                <button key={r} onClick={() => setRange(r)} className={`px-3 py-1 text-[12px] font-medium rounded ${range === r ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>{r}</button>
              ))}
            </div>
          </>
        }
      />

      {/* ═══════ SECTION 2 — STOCK RISK SUMMARY BANNER ═══════ */}
      <div className={`rounded-[14px] border p-5 mb-6 ${
        itemStatus === "critical" ? "bg-critical/[0.04] border-critical/15" :
        itemStatus === "warning" ? "bg-warning/[0.04] border-warning/15" :
        "bg-info/[0.04] border-info/15"
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center gap-5">

          {/* Left — status + text */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                itemStatus === "critical" ? "bg-critical/10 text-critical" :
                itemStatus === "warning" ? "bg-amber-100 text-amber-700" :
                "bg-green-100 text-green-700"
              }`}>
                <ShieldAlert className="w-3 h-3" />
                {statusLabel}
              </span>
              <span className="text-[12px] text-text-muted">{selectedBranch?.name}</span>
            </div>
            <h2 className="text-[18px] md:text-[20px] font-bold text-text-primary leading-snug mb-1.5">
              {bannerTitle}
            </h2>
            <p className="text-[13px] text-text-secondary leading-relaxed max-w-2xl">
              {bannerSubtitle}
            </p>
          </div>

          {/* Center — four metrics */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 shrink-0">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Current Stock</span>
              <span className="text-[17px] font-bold text-text-primary tabular-nums">{selectedItem?.currentStock} <span className="text-[11px] font-medium text-text-muted">{selectedItem?.unit}</span></span>
            </div>
            <div className="w-px h-8 bg-border/50 hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Safety Stock</span>
              <span className="text-[17px] font-bold text-text-primary tabular-nums">{selectedItem?.minStock} <span className="text-[11px] font-medium text-text-muted">{selectedItem?.unit}</span></span>
            </div>
            <div className="w-px h-8 bg-border/50 hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Stock Cover</span>
              <span className={`text-[17px] font-bold tabular-nums ${statusColor}`}>{currentDaysCover} <span className="text-[11px] font-medium text-text-muted">days</span></span>
            </div>
            <div className="w-px h-8 bg-border/50 hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Demand Trend</span>
              <span className="text-[17px] font-bold text-info tabular-nums">+5%</span>
            </div>
          </div>

          {/* Right — action buttons */}
          <div className="flex flex-row lg:flex-col gap-2.5 shrink-0">
            {matchingRec && (
              <Link href={`/recommendations?id=${matchingRec.id}`} className="flex items-center justify-center gap-2 px-4 h-[38px] bg-[var(--color-accent)] text-white rounded-lg text-[13px] font-semibold hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm whitespace-nowrap">
                Review Decision <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            <Link href="/inventory" className="flex items-center justify-center gap-2 px-4 h-[38px] bg-white border border-border rounded-lg text-[13px] font-medium text-text-primary hover:bg-surface-hover transition-colors shadow-sm whitespace-nowrap">
              <Eye className="w-3.5 h-3.5 text-text-muted" /> View Inventory Item
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════ SECTION 3+4 — CHART (left) + RISK EXPLANATION & SIMULATOR (right) ═══════ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">

        {/* ──── LEFT: FORECAST CHART ──── */}
        <div className="xl:col-span-8 flex flex-col bg-white border border-border rounded-[16px] p-6 shadow-sm min-h-[480px]">

          <div className="mb-2">
            <h2 className="text-[17px] font-bold text-text-primary">
              {selectedItem?.name || "Item"} Stock Forecast
            </h2>
            <p className="text-[13px] text-text-secondary mt-1 leading-relaxed max-w-xl">
              This forecast shows how available stock compares with expected demand and the safety stock level.
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4 pb-3 border-b border-border/50">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-[3px] rounded bg-text-muted" />
              <span className="text-[11px] font-medium text-text-secondary">Available stock</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-[3px] rounded border-b-2 border-dashed border-text-primary bg-transparent" />
              <span className="text-[11px] font-medium text-text-secondary">Expected demand</span>
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

          {/* Chart area */}
          <div className="flex-1 w-full relative overflow-hidden">

            {/* Y-axis label */}
            <div className="absolute left-0 top-1/2 text-[10px] font-medium text-text-muted tracking-wider uppercase select-none whitespace-nowrap z-20" style={{ transform: 'translateX(-14px) translateY(-50%) rotate(-90deg)' }}>
              Quantity in {selectedItem?.unit || "kg"}
            </div>

            <div className="ml-6 mr-2 h-full bg-surface/50 border border-border/50 rounded-lg flex items-center justify-center relative overflow-hidden">

              {/* Background shading */}
              <div className="absolute inset-0 opacity-15">
                <div className="absolute left-0 right-1/2 bottom-[20%] top-1/2 bg-blue-500/20 transition-all duration-1000" style={{ transform: simResults ? `translateY(${demandChange}px)` : "none" }} />
                <div className="absolute left-1/2 right-0 bottom-0 top-[30%] bg-[var(--color-intelligence)]/20" />
              </div>

              {/* SVG chart lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,80 L20,75 L40,70 L50,65" fill="none" stroke="currentColor" className="text-text-muted/60 transition-all duration-1000" strokeWidth="2.5" style={{ transform: simResults ? `translateY(${supplierDelay * 2}px)` : "none" }} />
                <path d="M0,70 L20,65 L40,68 L50,60 L60,40 L80,20 L100,5" fill="none" stroke="currentColor" className="text-text-primary/50 transition-all duration-1000" strokeWidth="1" strokeDasharray="3 2" />
                <path d={`M50,65 L60,${45 + demandChange / 2} L80,${25 + demandChange / 2} L100,${10 + demandChange / 2}`} fill="none" stroke="currentColor" className="text-[var(--color-intelligence)] transition-all duration-1000" strokeWidth="2.5" />
              </svg>

              {/* Safety stock line */}
              <div className="absolute bottom-1/4 left-0 right-0 border-t-2 border-critical border-dashed opacity-50" />

              {/* Scenario marker */}
              {simResults && (
                <div className="absolute z-10 transition-all duration-500" style={{ right: "10%", top: `${10 + demandChange / 2}%` }}>
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-md animate-pulse" />
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap font-medium text-text-primary">
                    <span className="text-critical font-bold">{simResults.risk} Risk</span><br/>
                    <span className="text-text-muted">{simResults.daysCover} days cover projected</span>
                  </div>
                </div>
              )}

              {/* Central callout when no scenario */}
              {!simResults && (
                <div className="relative flex flex-col items-center bg-white p-3 rounded-lg shadow-md border border-border text-center z-10 opacity-80">
                  <span className={`text-[13px] font-bold ${statusColor}`}>
                    {itemStatus === "critical" ? "Stock risk detected" : itemStatus === "warning" ? "Stock declining" : "Stock stable"}
                  </span>
                  <span className="text-[11px] text-text-muted mt-0.5">Based on current demand trend</span>
                </div>
              )}
            </div>

            <div className="text-center mt-2.5 text-[10px] font-medium text-text-muted uppercase tracking-wider select-none">
              Next {rangeDays} days
            </div>
          </div>

          {/* How to read this */}
          <div className="flex items-start gap-2.5 mt-4 pt-4 border-t border-border/50">
            <HelpCircle className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
            <div>
              <span className="text-[12px] font-semibold text-text-primary">How to read this</span>
              <p className="text-[12px] text-text-secondary leading-relaxed mt-0.5">
                If available stock falls below the safety stock line, the item needs attention. The scenario marker shows how risk changes when demand increases or supplier delivery is delayed.
              </p>
            </div>
          </div>
        </div>

        {/* ──── RIGHT: RISK EXPLANATION + SCENARIO SIMULATOR ──── */}
        <div className="xl:col-span-4 flex flex-col gap-6">

          {/* ── SECTION 4 — WHY THIS ITEM IS RISKY ── */}
          <div className="bg-white border border-border rounded-[16px] p-6 shadow-sm">
            <h3 className="text-[16px] font-bold text-text-primary mb-4">Why this item is risky</h3>

            <div className="flex flex-col gap-3">
              {/* Point 1 — Stock cover */}
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${Number(currentDaysCover) < 1 ? "bg-critical/10" : Number(currentDaysCover) < 3 ? "bg-amber-50" : "bg-green-50"}`}>
                  <Clock className={`w-3.5 h-3.5 ${Number(currentDaysCover) < 1 ? "text-critical" : Number(currentDaysCover) < 3 ? "text-amber-600" : "text-green-600"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-semibold text-text-primary">Stock cover</span>
                    <span className={`text-[13px] font-bold tabular-nums ${statusColor}`}>{currentDaysCover} days</span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed mt-0.5">
                    {Number(currentDaysCover) < 1 ? "Current stock will last less than one day." : `Current stock will last about ${currentDaysCover} days.`}
                  </p>
                </div>
              </div>

              {/* Point 2 — Current vs safety */}
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${itemStatus === "critical" ? "bg-critical/10" : itemStatus === "warning" ? "bg-amber-50" : "bg-green-50"}`}>
                  <Package className={`w-3.5 h-3.5 ${itemStatus === "critical" ? "text-critical" : itemStatus === "warning" ? "text-amber-600" : "text-green-600"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-semibold text-text-primary">Current / Safety stock</span>
                    <span className="text-[13px] font-bold text-text-primary tabular-nums">{selectedItem?.currentStock} / {selectedItem?.minStock} {selectedItem?.unit}</span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed mt-0.5">
                    {selectedItem && selectedItem.currentStock <= selectedItem.minStock
                      ? "Stock is already below the safe minimum."
                      : selectedItem && selectedItem.currentStock <= selectedItem.minStock * 1.5
                        ? "Stock is close to the safe minimum."
                        : "Stock is above the safe minimum."}
                  </p>
                </div>
              </div>

              {/* Point 3 — Demand trend */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-info/10">
                  <TrendingUp className="w-3.5 h-3.5 text-info" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-semibold text-text-primary">Demand trend</span>
                    <span className="text-[13px] font-bold text-info tabular-nums">+5%</span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed mt-0.5">Expected demand is increasing.</p>
                </div>
              </div>

              {/* Point 4 — Risk status */}
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${itemStatus === "critical" ? "bg-critical/10" : itemStatus === "warning" ? "bg-amber-50" : "bg-green-50"}`}>
                  <AlertTriangle className={`w-3.5 h-3.5 ${statusColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-semibold text-text-primary">Risk status</span>
                    <span className={`text-[13px] font-bold ${statusColor}`}>{statusLabel}</span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed mt-0.5">
                    {itemStatus === "critical" ? "Action is required now." : itemStatus === "warning" ? "Monitor closely." : "No action required."}
                  </p>
                </div>
              </div>
            </div>

            {/* Plain-language summary */}
            <div className="mt-4 pt-3.5 border-t border-border/50">
              <p className="text-[12px] text-text-secondary leading-relaxed">
                {itemStatus === "critical" ? (
                  <>{selectedItem?.name} is already below the safe stock level. If demand rises or supplier delivery is delayed, the branch may not have enough stock to serve expected demand.</>
                ) : itemStatus === "warning" ? (
                  <>{selectedItem?.name} is approaching the safety threshold. Continued monitoring and early replenishment planning is recommended.</>
                ) : (
                  <>{selectedItem?.name} has adequate stock levels. No immediate risk detected.</>
                )}
              </p>
            </div>
          </div>

          {/* ── SECTION 5 — WHAT-IF SIMULATOR ── */}
          <div className="bg-white border border-border rounded-[16px] p-6 shadow-sm flex-1 flex flex-col">
            <h3 className="text-[16px] font-bold text-text-primary mb-1">What-if Simulator</h3>
            <p className="text-[12px] text-text-secondary mb-5 leading-relaxed">
              Test how demand changes or supplier delays affect stock risk.
            </p>

            <div className="flex flex-col gap-5">
              {/* Demand slider */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-text-secondary">
                  Demand Change: <span className="text-text-primary font-semibold">{demandChange > 0 ? "+" : ""}{demandChange}%</span>
                </label>
                <input type="range" min="-20" max="50" value={demandChange}
                  onChange={(e) => { setDemandChange(Number(e.target.value)); setSimResults(null); }}
                  className="w-full accent-[var(--color-intelligence)]" />
                <div className="flex justify-between text-[10px] text-text-muted"><span>-20%</span><span>+50%</span></div>
              </div>

              {/* Supplier delay slider */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-text-secondary">
                  Supplier Delay: <span className="text-text-primary font-semibold">{supplierDelay} {supplierDelay === 1 ? "day" : "days"}</span>
                </label>
                <input type="range" min="0" max="5" value={supplierDelay}
                  onChange={(e) => { setSupplierDelay(Number(e.target.value)); setSimResults(null); }}
                  className="w-full accent-amber-500" />
                <div className="flex justify-between text-[10px] text-text-muted"><span>0</span><span>5 days</span></div>
              </div>

              <button onClick={handleRunScenario} disabled={isRunning}
                className="flex items-center justify-center gap-2 w-full h-[40px] bg-[var(--color-sidebar-bg)] text-white rounded-[8px] text-[13px] font-semibold hover:bg-black transition-colors shadow-sm disabled:opacity-50">
                {isRunning ? <span className="animate-pulse">Simulating…</span> : <><Play className="w-4 h-4" /> Run Scenario</>}
              </button>
            </div>

            {/* ── SCENARIO RESULT ── */}
            {simResults && (
              <div className="mt-5 pt-4 border-t border-border/60 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className={`p-4 rounded-xl border ${
                  simResults.risk === "Critical" ? "bg-critical/5 border-critical/20" :
                  simResults.risk === "High" ? "bg-amber-50 border-amber-200" :
                  "bg-green-50 border-green-200"
                }`}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Scenario Result</span>
                    <span className={`text-[12px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                      simResults.risk === "Critical" ? "bg-critical/10 text-critical" :
                      simResults.risk === "High" ? "bg-amber-100 text-amber-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {simResults.risk} Risk
                    </span>
                  </div>

                  {/* Projected cover */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] text-text-secondary">Projected Stock Cover</span>
                    <span className="text-[15px] font-bold text-text-primary tabular-nums">{simResults.daysCover} days</span>
                  </div>

                  {/* Risk change */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-border/30">
                    <span className="text-[13px] text-text-secondary">Risk Change</span>
                    <span className={`text-[13px] font-semibold ${simResults.riskChange === "Worse than baseline" ? "text-critical" : simResults.riskChange === "Better than baseline" ? "text-green-600" : "text-text-muted"}`}>
                      {simResults.riskChange}
                    </span>
                  </div>

                  {/* Reason */}
                  <div className="mb-3">
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">Reason</span>
                    <p className="text-[12px] text-text-secondary leading-relaxed">{simResults.reason}</p>
                  </div>

                  {/* Recommended next step */}
                  <div className="mb-3">
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">Recommended next step</span>
                    <p className="text-[13px] font-medium text-text-primary">{simResults.action}</p>
                  </div>

                  {/* Review Decision */}
                  {(simResults.risk === "Critical" || simResults.risk === "High") && matchingRec && (
                    <Link href={`/recommendations?id=${matchingRec.id}`}
                      className="flex items-center justify-center gap-2 w-full h-[38px] bg-[var(--color-accent)] text-white rounded-lg text-[13px] font-semibold hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm mt-1">
                      Review Decision <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════ SECTION 6 — RECOMMENDED NEXT ACTION ═══════ */}
      {matchingRec && (
        <div className="bg-white border border-border rounded-[16px] p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Left — text */}
            <div className="flex-1 min-w-0">
              <h3 className="text-[16px] font-bold text-text-primary mb-1">Recommended Next Action</h3>
              <p className="text-[13px] text-text-secondary mb-4">
                Review the replenishment decision for {selectedItem?.name}.
              </p>

              {/* Strategy badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[var(--color-intelligence)] text-[var(--color-sidebar-bg)]">
                  {recStrategy}
                </span>
              </div>

              {/* Transfer + Purchase details */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {matchingRec.hybridDetails?.transferQty && matchingRec.sourceBranchName && (
                  <div className="flex items-center gap-2.5 p-3 bg-surface rounded-lg border border-border/50 flex-1">
                    <Truck className="w-4 h-4 text-info shrink-0" />
                    <div>
                      <span className="text-[12px] font-semibold text-text-primary block">Transfer {matchingRec.hybridDetails.transferQty} {matchingRec.unit}</span>
                      <span className="text-[11px] text-text-muted">{matchingRec.sourceBranchName} → {matchingRec.branchName}</span>
                    </div>
                  </div>
                )}
                {matchingRec.hybridDetails?.purchaseQty && (
                  <div className="flex items-center gap-2.5 p-3 bg-surface rounded-lg border border-border/50 flex-1">
                    <Package className="w-4 h-4 text-accent shrink-0" />
                    <div>
                      <span className="text-[12px] font-semibold text-text-primary block">Purchase {matchingRec.hybridDetails.purchaseQty} {matchingRec.unit}</span>
                      <span className="text-[11px] text-text-muted">{matchingRec.supplierName}</span>
                    </div>
                  </div>
                )}
                {/* Fallback for non-hybrid */}
                {!matchingRec.hybridDetails && (
                  <div className="flex items-center gap-2.5 p-3 bg-surface rounded-lg border border-border/50 flex-1">
                    <Package className="w-4 h-4 text-accent shrink-0" />
                    <div>
                      <span className="text-[12px] font-semibold text-text-primary block">{matchingRec.type === "transfer" ? "Transfer" : "Purchase"} {matchingRec.suggestedQty} {matchingRec.unit}</span>
                      <span className="text-[11px] text-text-muted">{matchingRec.type === "transfer" ? matchingRec.sourceBranchName : matchingRec.supplierName}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Reason */}
              <p className="text-[12px] text-text-secondary leading-relaxed">
                {matchingRec.type === "hybrid"
                  ? "Transfer alone is not enough to cover projected demand, while purchase alone may create unnecessary excess stock. A hybrid action balances cost, risk, and service availability."
                  : matchingRec.reasoning}
              </p>
            </div>

            {/* Right — buttons */}
            <div className="flex flex-col gap-2.5 shrink-0 lg:w-[180px] lg:pt-6">
              <Link href={`/recommendations?id=${matchingRec.id}`}
                className="flex items-center justify-center gap-2 w-full h-[40px] bg-[var(--color-accent)] text-white rounded-lg text-[13px] font-semibold hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm">
                Review Decision <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/inventory"
                className="flex items-center justify-center gap-2 w-full h-[40px] bg-white border border-border rounded-lg text-[13px] font-medium text-text-primary hover:bg-surface-hover transition-colors shadow-sm">
                <Eye className="w-3.5 h-3.5 text-text-muted" /> View Inventory Item
              </Link>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
