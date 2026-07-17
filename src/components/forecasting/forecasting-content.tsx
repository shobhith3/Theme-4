"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import {
  ChevronDown, Play, HelpCircle, ArrowRight, Eye,
  ShieldAlert, TrendingUp, Package, Clock, Truck,
  AlertTriangle, Brain, Target, LineChart, ShieldCheck
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { GuidedDecisionReview } from "@/components/decision/guided-decision-review";

export default function ForecastingContent({
  metrics,
  inventory,
  branches,
  decisions
}: {
  metrics: any;
  inventory: any[];
  branches: any[];
  decisions: any[];
}) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "studio">("dashboard");

  // Studio state
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || "");
  const [selectedItemId, setSelectedItemId] = useState(inventory.find(i => i.branchId === branches[0]?.id)?.id || "");
  const [range, setRange] = useState("14D");

  const [demandChange, setDemandChange] = useState(10);
  const [supplierDelay, setSupplierDelay] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);
  const [simResults, setSimResults] = useState<{
    risk: string; daysCover: number; reason: string;
    riskChange: string; action: string;
  } | null>(null);

  const selectedItem = useMemo(() => inventory.find(i => i.id === selectedItemId), [inventory, selectedItemId]);
  const selectedBranch = useMemo(() => branches.find(b => b.id === selectedBranchId), [branches, selectedBranchId]);

  const matchingDecision = useMemo(() => {
    if (!selectedItem) return null;
    return decisions.find(d => d.itemId === selectedItem.itemId && d.branchId === selectedItem.branchId);
  }, [selectedItem, decisions]);

  // Computed values
  const currentDaysCover = selectedItem
    ? (selectedItem.avgDailyUsage > 0 ? (selectedItem.currentStock / selectedItem.avgDailyUsage).toFixed(1) : "N/A")
    : "0";

  const itemStatus = selectedItem
    ? (selectedItem.currentStock <= selectedItem.safeStock ? "critical"
      : selectedItem.currentStock <= selectedItem.safeStock * 1.5 ? "warning"
        : "healthy")
    : "unknown";

  const statusLabel = itemStatus === "critical" ? "Critical" : itemStatus === "warning" ? "Warning" : "Healthy";
  const statusColor = itemStatus === "critical" ? "text-critical" : itemStatus === "warning" ? "text-warning" : "text-info";
  const rangeDays = range === "7D" ? 7 : range === "14D" ? 14 : 30;

  const handleRunScenario = () => {
    setIsRunning(true);
    setTimeout(() => {
      if (!selectedItem) { setIsRunning(false); return; }

      const baseDaysCover = selectedItem.avgDailyUsage > 0 ? selectedItem.currentStock / selectedItem.avgDailyUsage : 0;
      const adjustedCover = baseDaysCover / (1 + demandChange / 100);
      let finalCover = adjustedCover - (supplierDelay * 0.2);
      if (finalCover < 0) finalCover = 0;

      const risk = finalCover < (selectedItem.safeStock / 10) ? "Critical" : finalCover < 2 ? "High" : "Stable";

      let reason = "";
      if (demandChange > 0 && supplierDelay > 0) reason = `Higher demand and supplier delay reduce the available stock buffer.`;
      else if (demandChange > 0) reason = `Higher demand reduces the available stock buffer.`;
      else if (demandChange < 0 && supplierDelay > 0) reason = `Supplier delay adds risk despite lower demand.`;
      else if (supplierDelay > 0) reason = `Supplier delay reduces the available stock buffer.`;
      else if (demandChange < 0) reason = `Lower demand increases the available stock buffer.`;
      else reason = `Under current conditions, the available stock buffer remains unchanged.`;

      const riskChange = finalCover < baseDaysCover ? "Worse than baseline" : finalCover > baseDaysCover ? "Better than baseline" : "Same as baseline";
      const action = risk === "Critical" || risk === "High" ? "Review replenishment decision" : "No immediate action required";

      setSimResults({ risk, daysCover: Number(finalCover.toFixed(1)), reason, riskChange, action });
      setIsRunning(false);
    }, 600);
  };

  return (
    <>
      <div className="flex items-center gap-6 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`pb-3 text-[14px] font-bold transition-colors border-b-2 flex items-center gap-2 ${activeTab === "dashboard" ? "text-text-primary border-[var(--color-accent)]" : "text-text-muted border-transparent hover:text-text-primary"}`}
        >
          <Brain className="w-4 h-4" />
          Intelligence Dashboard
        </button>
        <button
          onClick={() => setActiveTab("studio")}
          className={`pb-3 text-[14px] font-bold transition-colors border-b-2 flex items-center gap-2 ${activeTab === "studio" ? "text-text-primary border-[var(--color-accent)]" : "text-text-muted border-transparent hover:text-text-primary"}`}
        >
          <LineChart className="w-4 h-4" />
          Forecast Studio
        </button>
      </div>

      {activeTab === "dashboard" && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-[13px] font-bold text-text-secondary uppercase tracking-wider">Revenue Protected</span>
              </div>
              <div className="text-[28px] font-black text-text-primary mt-2 tabular-nums">
                ₹{metrics.totalRevenueProtected.toLocaleString()}
              </div>
              <div className="text-[12px] text-text-muted mt-1">From avoiding stockouts</div>
            </div>

            <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-[13px] font-bold text-text-secondary uppercase tracking-wider">AI Accuracy</span>
              </div>
              <div className="text-[28px] font-black text-text-primary mt-2 tabular-nums">
                {metrics.avgAccuracy.toFixed(1)}%
              </div>
              <div className="text-[12px] text-text-muted mt-1">Average forecast accuracy</div>
            </div>

            <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-[13px] font-bold text-text-secondary uppercase tracking-wider">Waste Avoided</span>
              </div>
              <div className="text-[28px] font-black text-text-primary mt-2 tabular-nums">
                {metrics.wasteAvoided}
              </div>
              <div className="text-[12px] text-text-muted mt-1">Decisions preventing overstock</div>
            </div>

            <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-[13px] font-bold text-text-secondary uppercase tracking-wider">Stockouts Avoided</span>
              </div>
              <div className="text-[28px] font-black text-text-primary mt-2 tabular-nums">
                {metrics.stockoutsAvoided}
              </div>
              <div className="text-[12px] text-text-muted mt-1">Total critical shortages prevented</div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border/50">
              <h3 className="text-[16px] font-bold text-text-primary">Recent Outcomes</h3>
              <p className="text-[13px] text-text-secondary mt-0.5">Historical record of AI decisions and their true impact.</p>
            </div>
            <table className="w-full text-left text-[13px]">
              <thead className="bg-surface-hover border-b border-border text-text-secondary">
                <tr>
                  <th className="py-3 px-5 font-semibold">Date</th>
                  <th className="py-3 px-5 font-semibold">Decision Type</th>
                  <th className="py-3 px-5 font-semibold text-right">Accuracy</th>
                  <th className="py-3 px-5 font-semibold text-right">Revenue Protected</th>
                  <th className="py-3 px-5 font-semibold text-center">Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {metrics.recentOutcomes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-muted text-[13px]">
                      No outcomes recorded yet. Execute decisions in the Command Center to generate data.
                    </td>
                  </tr>
                ) : (
                  metrics.recentOutcomes.map((o: any) => (
                    <tr key={o.id} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="py-3 px-5 font-medium">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-5 uppercase tracking-wider text-[11px] font-bold text-text-muted">{o.decisionType}</td>
                      <td className="py-3 px-5 text-right font-medium">{o.accuracy}%</td>
                      <td className="py-3 px-5 text-right font-bold text-green-600">₹{o.revenueProtected.toLocaleString()}</td>
                      <td className="py-3 px-5">
                        <div className="flex justify-center gap-2">
                          {o.stockoutAvoided && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[11px] font-bold">Stockout Avoided</span>}
                          {o.wasteAvoided && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[11px] font-bold">Waste Avoided</span>}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "studio" && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-4 p-4 bg-white border border-border rounded-xl shadow-sm">
            {/* Item selector */}
            <div className="relative flex-1">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1">Item</label>
              <select
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-[13px] font-medium text-text-primary"
                value={selectedItemId}
                onChange={(e) => { setSelectedItemId(e.target.value); setSimResults(null); }}
              >
                {inventory.filter(i => i.branchId === selectedBranchId).map(i => (
                  <option key={i.id} value={i.id}>{i.itemName}</option>
                ))}
              </select>
            </div>

            {/* Branch selector */}
            <div className="relative flex-1">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1">Branch</label>
              <select
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-[13px] font-medium text-text-primary"
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
            </div>

            {/* Range selector */}
            <div className="relative w-32">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1">Horizon</label>
              <select
                className="w-full px-3 py-2 bg-surface border border-border rounded-md text-[13px] font-medium text-text-primary"
                value={range}
                onChange={(e) => setRange(e.target.value)}
              >
                <option value="7D">7 Days</option>
                <option value="14D">14 Days</option>
                <option value="30D">30 Days</option>
              </select>
            </div>
          </div>

          {selectedItem ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
              {/* LEFT: FORECAST CHART */}
              <div className="xl:col-span-8 flex flex-col bg-white border border-border rounded-[16px] p-6 shadow-sm min-h-[480px]">
                <div className="mb-2">
                  <h2 className="text-[17px] font-bold text-text-primary">
                    {selectedItem.itemName} Stock Forecast
                  </h2>
                  <p className="text-[13px] text-text-secondary mt-1 leading-relaxed max-w-xl">
                    This forecast shows how available stock compares with expected demand and the safety stock level.
                  </p>
                </div>

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
                </div>

                <div className="flex-1 w-full relative overflow-hidden">
                  <div className="ml-6 mr-2 h-full bg-surface/50 border border-border/50 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {!simResults && (
                      <div className="relative flex flex-col items-center bg-white p-3 rounded-lg shadow-md border border-border text-center z-10 opacity-80">
                        <span className={`text-[13px] font-bold ${statusColor}`}>
                          {itemStatus === "critical" ? "Stock risk detected" : itemStatus === "warning" ? "Stock declining" : "Stock stable"}
                        </span>
                        <span className="text-[11px] text-text-muted mt-0.5">Based on current demand trend</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: RISK EXPLANATION + SCENARIO SIMULATOR */}
              <div className="xl:col-span-4 flex flex-col gap-6">
                <div className="bg-white border border-border rounded-[16px] p-6 shadow-sm">
                  <h3 className="text-[16px] font-bold text-text-primary mb-4">Why this item is risky</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-surface">
                        <Clock className="w-3.5 h-3.5 text-text-muted" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[13px] font-semibold text-text-primary">Stock cover</span>
                          <span className={`text-[13px] font-bold tabular-nums ${statusColor}`}>{currentDaysCover} days</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-surface">
                        <Package className="w-3.5 h-3.5 text-text-muted" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[13px] font-semibold text-text-primary">Current / Safety stock</span>
                          <span className="text-[13px] font-bold text-text-primary tabular-nums">{selectedItem.currentStock} / {selectedItem.safeStock} {selectedItem.unit}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-border rounded-[16px] p-6 shadow-sm flex-1 flex flex-col">
                  <h3 className="text-[16px] font-bold text-text-primary mb-1">What-if Simulator</h3>
                  <div className="flex flex-col gap-5 mt-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-text-secondary">
                        Demand Change: <span className="text-text-primary font-semibold">{demandChange > 0 ? "+" : ""}{demandChange}%</span>
                      </label>
                      <input type="range" min="-20" max="50" value={demandChange}
                        onChange={(e) => { setDemandChange(Number(e.target.value)); setSimResults(null); }}
                        className="w-full accent-[var(--color-intelligence)]" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-text-secondary">
                        Supplier Delay: <span className="text-text-primary font-semibold">{supplierDelay} {supplierDelay === 1 ? "day" : "days"}</span>
                      </label>
                      <input type="range" min="0" max="5" value={supplierDelay}
                        onChange={(e) => { setSupplierDelay(Number(e.target.value)); setSimResults(null); }}
                        className="w-full accent-amber-500" />
                    </div>

                    <button onClick={handleRunScenario} disabled={isRunning}
                      className="flex items-center justify-center gap-2 w-full h-[40px] bg-[var(--color-sidebar-bg)] text-white rounded-[8px] text-[13px] font-semibold hover:bg-black transition-colors shadow-sm disabled:opacity-50">
                      {isRunning ? <span className="animate-pulse">Simulating…</span> : <><Play className="w-4 h-4" /> Run Scenario</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border border-border rounded-xl bg-white flex flex-col items-center justify-center">
              <Package className="w-12 h-12 text-text-muted mb-4 opacity-50" />
              <p className="text-text-secondary text-[14px]">No items found for this branch.</p>
            </div>
          )}
        </div>
      )}

      {selectedDecisionId && (
        <GuidedDecisionReview
          isOpen={true}
          decisionId={selectedDecisionId}
          onClose={() => setSelectedDecisionId(null)}
        />
      )}
    </>
  );
}
