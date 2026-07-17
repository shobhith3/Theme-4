"use client";

import { PageContainer } from "@/components/common/page-container";
import { useStore } from "@/store/useStore";
import { useState, useMemo, useEffect } from "react";
import { GuidedDecisionReview } from "@/components/decision/guided-decision-review";
import { AlertTriangle, TrendingDown, RefreshCcw, PackageX, ShieldAlert, ArrowRight, Check, Plus, Calendar, Filter, MoreHorizontal, Truck } from "lucide-react";
import Link from "next/link";
import { Recommendation } from "@/types";
import { getPendingDecisions } from "@/app/actions/decision-actions";
import { getRealData } from "@/app/actions/stock-actions";
import { resetDemo, triggerDemandSpike } from "@/app/actions/demo-actions";
import { runFullRiskScan } from "@/app/actions/scan-actions";
export default function CommandCenterPage() {
  const recommendations = useStore((s) => s.recommendations);
  const inventory = useStore((s) => s.inventory);
  const approveRecommendation = useStore((s) => s.approveRecommendation);
  const batchApproveRecommendations = useStore((s) => s.batchApproveRecommendations);
  const suppliers = useStore((s) => s.suppliers);

  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>("all");

  const pendingDecisions = useMemo(() => {
    return recommendations.filter(r => r.status === "new" || r.status === "needs_review");
  }, [recommendations]);

  const filteredDecisions = useMemo(() => {
    let filtered = pendingDecisions;
    if (filterLevel !== "all") {
      filtered = filtered.filter(d => d.urgency.toLowerCase() === filterLevel);
    }
    return filtered;
  }, [pendingDecisions, filterLevel]);

  const countAll = pendingDecisions.length;
  const countCritical = pendingDecisions.filter(d => d.urgency === 'critical').length;
  const countHigh = pendingDecisions.filter(d => d.urgency === 'high').length;
  const countMedium = pendingDecisions.filter(d => d.urgency === 'medium').length;
  const countLow = pendingDecisions.filter(d => d.urgency === 'low').length;

  // Derived metrics for summary cards
  const needsReviewCount = pendingDecisions.length || 7;
  const revenueAtRisk = pendingDecisions.reduce((acc, r) => acc + (r.revenueAtRisk || 0), 0) || 84200;
  
  const autoApprovedCount = 42; 
  const wasteAvoided = 18500; 
  const supplierIssues = 3; 

  return (
    <PageContainer>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Good morning, Rohit 👋</h1>
          <p className="text-[14px] text-text-secondary mt-1">Here’s what needs your attention today.</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-md text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors">
            <Calendar className="w-4 h-4" />
            21 May 2025
          </button>
          
          <button 
            onClick={async () => {
              setIsScanning(true);
              await resetDemo();
              setIsScanning(false);
              window.location.reload();
            }}
            disabled={isScanning}
            className="flex items-center gap-2 px-3 py-2 bg-critical/10 border border-critical/20 text-critical rounded-md text-[13px] font-medium hover:bg-critical/20 transition-colors disabled:opacity-50"
          >
            <RefreshCcw className="w-4 h-4" />
            Reset Demo
          </button>

          <button 
            onClick={async () => {
              setIsScanning(true);
              await triggerDemandSpike();
              setIsScanning(false);
              window.location.reload();
            }}
            disabled={isScanning}
            className="flex items-center gap-2 px-3 py-2 bg-warning/10 border border-warning/20 text-warning rounded-md text-[13px] font-medium hover:bg-warning/20 transition-colors disabled:opacity-50"
          >
            <TrendingDown className="w-4 h-4" />
            Demand Spike
          </button>

          <button 
            onClick={async () => {
              setIsScanning(true);
              await runFullRiskScan();
              setIsScanning(false);
              window.location.reload();
            }}
            disabled={isScanning}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--color-intelligence)] text-white rounded-md text-[13px] font-semibold hover:bg-[var(--color-intelligence-hover)] transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Run Risk Scan'}
          </button>
          
          <div className="relative ml-2">
            <button 
              onClick={() => setNewMenuOpen(!newMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-intelligence)] text-white rounded-md text-[13px] font-semibold hover:bg-[var(--color-intelligence-hover)] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
            {newMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg py-1 z-50">
                <Link href="/stock-intake" className="block px-4 py-2 text-[13px] text-text-primary hover:bg-surface-hover">New Stock Intake</Link>
                <Link href="/purchase-orders" className="block px-4 py-2 text-[13px] text-text-primary hover:bg-surface-hover">New Purchase Order</Link>
                <Link href="/transfers" className="block px-4 py-2 text-[13px] text-text-primary hover:bg-surface-hover">New Transfer</Link>
                <Link href="/inventory" className="block px-4 py-2 text-[13px] text-text-primary hover:bg-surface-hover">New Inventory Item</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-surface border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium text-text-secondary">Needs Review</span>
            <div className="w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-warning" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary mb-1">{needsReviewCount}</p>
            <p className="text-[11px] text-text-muted">3 Critical • 4 High</p>
          </div>
        </div>

        <div className="bg-surface border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium text-text-secondary">Revenue at Risk</span>
            <div className="w-6 h-6 rounded-full bg-critical/10 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5 text-critical" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary mb-1">₹{revenueAtRisk.toLocaleString()}</p>
            <p className="text-[11px] text-text-muted">Today’s potential risk</p>
          </div>
        </div>

        <div className="bg-surface border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium text-text-secondary">Auto-Approved</span>
            <div className="w-6 h-6 rounded-full bg-[var(--color-intelligence)]/10 flex items-center justify-center">
              <RefreshCcw className="w-3.5 h-3.5 text-[var(--color-intelligence)]" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary mb-1">{autoApprovedCount}</p>
            <p className="text-[11px] text-text-muted">Routine decisions</p>
          </div>
        </div>

        <div className="bg-surface border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium text-text-secondary">Waste Risk Avoided</span>
            <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
              <PackageX className="w-3.5 h-3.5 text-success" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary mb-1">₹{wasteAvoided.toLocaleString()}</p>
            <p className="text-[11px] text-text-muted">This month</p>
          </div>
        </div>

        <div className="bg-surface border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium text-text-secondary">Supplier Issues</span>
            <div className="w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5 text-warning" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary mb-1">{supplierIssues}</p>
            <p className="text-[11px] text-text-muted">Action required</p>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column (Center) - Today's Decisions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-surface border border-border rounded-xl shadow-sm p-5">
            <h2 className="text-[16px] font-bold text-text-primary mb-4">Today’s Decisions</h2>
            
            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-border mb-4 pb-2">
              <button onClick={() => setFilterLevel('all')} className={`text-[13px] font-medium pb-2 ${filterLevel === 'all' ? 'font-semibold text-[var(--color-intelligence-text)] border-b-2 border-[var(--color-intelligence)] -mb-[9px]' : 'text-text-muted hover:text-text-primary'}`}>
                All <span className="ml-1 text-[11px] bg-[var(--color-intelligence-muted)] px-1.5 py-0.5 rounded-full text-[var(--color-intelligence-text)]">{countAll}</span>
              </button>
              <button onClick={() => setFilterLevel('critical')} className={`text-[13px] font-medium pb-2 ${filterLevel === 'critical' ? 'font-semibold text-[var(--color-intelligence-text)] border-b-2 border-[var(--color-intelligence)] -mb-[9px]' : 'text-text-muted hover:text-text-primary'}`}>
                Critical <span className="ml-1 text-[11px] bg-surface-hover px-1.5 py-0.5 rounded-full">{countCritical}</span>
              </button>
              <button onClick={() => setFilterLevel('high')} className={`text-[13px] font-medium pb-2 ${filterLevel === 'high' ? 'font-semibold text-[var(--color-intelligence-text)] border-b-2 border-[var(--color-intelligence)] -mb-[9px]' : 'text-text-muted hover:text-text-primary'}`}>
                High <span className="ml-1 text-[11px] bg-surface-hover px-1.5 py-0.5 rounded-full">{countHigh}</span>
              </button>
              <button onClick={() => setFilterLevel('medium')} className={`text-[13px] font-medium pb-2 ${filterLevel === 'medium' ? 'font-semibold text-[var(--color-intelligence-text)] border-b-2 border-[var(--color-intelligence)] -mb-[9px]' : 'text-text-muted hover:text-text-primary'}`}>
                Medium <span className="ml-1 text-[11px] bg-surface-hover px-1.5 py-0.5 rounded-full">{countMedium}</span>
              </button>
              <button onClick={() => setFilterLevel('low')} className={`text-[13px] font-medium pb-2 ${filterLevel === 'low' ? 'font-semibold text-[var(--color-intelligence-text)] border-b-2 border-[var(--color-intelligence)] -mb-[9px]' : 'text-text-muted hover:text-text-primary'}`}>
                Low <span className="ml-1 text-[11px] bg-surface-hover px-1.5 py-0.5 rounded-full">{countLow}</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {filteredDecisions.length === 0 ? (
                <div className="text-[13px] text-text-muted py-4 text-center">No decisions found for this filter.</div>
              ) : (
                filteredDecisions.map((decision) => (
                  <DecisionRow 
                    key={decision.id} 
                    decision={decision} 
                    inventoryItem={inventory.find(i => i.id === decision.itemId && i.branchId === decision.branchId)}
                    onReview={() => setSelectedDecisionId(decision.id)}
                  />
                ))
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <Link href="/command-center" className="text-[13px] font-medium text-[var(--color-intelligence-text)] hover:text-[var(--color-intelligence-text-dark)] hover:underline flex items-center gap-1">
                View all decisions <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bottom Cards: POs and Transfers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface border border-border rounded-xl shadow-sm p-5 flex flex-col">
              <h2 className="text-[16px] font-bold text-text-primary mb-4">Purchase Orders</h2>
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="text-[11px] font-medium px-2 py-1 bg-surface-hover rounded-full">Draft 5</span>
                <span className="text-[11px] font-medium px-2 py-1 bg-surface-hover rounded-full">Sent 3</span>
                <span className="text-[11px] font-medium px-2 py-1 bg-surface-hover rounded-full">Confirmed 7</span>
                <span className="text-[11px] font-medium px-2 py-1 bg-surface-hover rounded-full">Partially Received 2</span>
              </div>
              <div className="flex flex-col gap-3 flex-1">
                <PORow id="PO-2025-142" supplier="FreshRoute Foods" value="₹22,680" date="23 May" status="Sent" />
                <PORow id="PO-2025-141" supplier="Deccan Traders" value="₹15,450" date="24 May" status="Confirmed" />
                <PORow id="PO-2025-140" supplier="Warangal Agri Co-op" value="₹8,750" date="22 May" status="Partially Received" />
              </div>
              <Link href="/purchase-orders" className="text-[13px] font-medium text-[var(--color-intelligence-text)] hover:text-[var(--color-intelligence-text-dark)] hover:underline mt-4 pt-4 border-t border-border inline-block">
                View all purchase orders →
              </Link>
            </div>

            <div className="bg-surface border border-border rounded-xl shadow-sm p-5 flex flex-col">
              <h2 className="text-[16px] font-bold text-text-primary mb-4">Transfers</h2>
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="text-[11px] font-medium px-2 py-1 bg-surface-hover rounded-full">Draft 2</span>
                <span className="text-[11px] font-medium px-2 py-1 bg-[var(--color-intelligence-muted)] text-[var(--color-intelligence-text)] rounded-full">In Transit 3</span>
                <span className="text-[11px] font-medium px-2 py-1 bg-success/10 text-success rounded-full">Received 5</span>
              </div>
              <div className="flex flex-col gap-3 flex-1">
                <TransferRow id="TR-2025-035" route="Warangal Hub → Hyd Central" qty="18 kg" status="In Transit" />
                <TransferRow id="TR-2025-034" route="Siddipet Main → Hyd Central" qty="12 kg" status="Received" />
                <TransferRow id="TR-2025-033" route="Warangal Hub → Siddipet Main" qty="20 kg" status="Draft" />
              </div>
              <Link href="/transfers" className="text-[13px] font-medium text-[var(--color-intelligence-text)] hover:text-[var(--color-intelligence-text-dark)] hover:underline mt-4 pt-4 border-t border-border inline-block">
                View all transfers →
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface border border-border rounded-xl shadow-sm p-5">
            <h2 className="text-[14px] font-bold text-text-primary mb-4">Inventory Health</h2>
            
            {/* Donut chart mock */}
            <div className="h-32 flex items-center justify-center mb-4">
              <div className="w-24 h-24 rounded-full border-[12px] border-border relative">
                <div className="absolute inset-[-12px] rounded-full border-[12px] border-transparent border-t-success border-r-success transform rotate-45" />
                <div className="absolute inset-[-12px] rounded-full border-[12px] border-transparent border-t-warning transform -rotate-[45deg]" />
                <div className="absolute inset-[-12px] rounded-full border-[12px] border-transparent border-t-critical transform -rotate-[120deg]" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-success"></div> Healthy</span>
                <span className="font-semibold">65%</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-warning"></div> Low Stock</span>
                <span className="font-semibold">20%</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-critical"></div> Critical</span>
                <span className="font-semibold">10%</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-text-muted"></div> Overstock</span>
                <span className="font-semibold">5%</span>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl shadow-sm p-5">
            <h2 className="text-[14px] font-bold text-text-primary mb-4">Top Risk Items</h2>
            <div className="flex flex-col gap-4">
              <RiskItemRow name="Chicken Breast" branch="Hyderabad Central" value="₹33,600" />
              <RiskItemRow name="Paneer" branch="Hyderabad Central" value="₹18,400" />
              <RiskItemRow name="Tomatoes" branch="Hyderabad Central" value="₹11,250" />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl shadow-sm p-5">
            <h2 className="text-[14px] font-bold text-text-primary mb-4">Recent Activities</h2>
            <div className="flex flex-col gap-4 relative">
              <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border z-0"></div>
              <ActivityRow icon={<PackageX className="w-3 h-3 text-white" />} bg="bg-success" title="Stock received" text="Chicken Breast • 40 kg" time="2 hrs ago" />
              <ActivityRow icon={<Truck className="w-3 h-3 text-white" />} bg="bg-success" title="Transfer completed" text="18 kg to Hyderabad Central" time="4 hrs ago" />
              <ActivityRow icon={<Check className="w-3 h-3 text-white" />} bg="bg-warning" title="PO created" text="PO-2025-142 • FreshRoute Foods" time="5 hrs ago" />
            </div>
          </div>
        </div>
      </div>

      {selectedDecisionId && (
        <GuidedDecisionReview
          isOpen={true}
          decisionId={selectedDecisionId}
          onClose={() => setSelectedDecisionId(null)}
        />
      )}
    </PageContainer>
  );
}

// Subcomponents

function DecisionRow({ decision, inventoryItem, onReview }: { decision: Recommendation, inventoryItem?: any, onReview: () => void }) {
  const isCritical = decision.urgency === 'critical';
  const typeLabel = decision.type === 'hybrid' ? 'Hybrid Replenishment' : decision.type === 'procure' ? 'Purchase' : decision.type === 'transfer' ? 'Transfer' : 'Stock Adjustment';
  
  let subtext = "";
  if (decision.type === 'hybrid') subtext = "Transfer + Purchase";
  else if (decision.type === 'procure') subtext = `From ${decision.supplierName}`;
  else if (decision.type === 'transfer') subtext = `From ${decision.sourceBranchName}`;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between p-3 border border-border rounded-lg bg-background hover:bg-surface-hover transition-colors gap-4">
      <div className="flex items-start lg:items-center gap-3 flex-1 min-w-0">
        <div className={`shrink-0 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mt-1 lg:mt-0 ${isCritical ? 'bg-critical/10 text-critical' : decision.urgency === 'high' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'}`}>
          {decision.urgency}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-semibold text-text-primary leading-tight truncate">{decision.itemName}</span>
            <span className="text-[11px] text-text-secondary px-1.5 py-0.5 bg-surface-hover border border-border rounded whitespace-nowrap">{decision.branchName}</span>
          </div>
          <div className="text-[12px] text-critical flex items-start lg:items-center gap-1 mt-1">
            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 lg:mt-0" />
            <span className="line-clamp-2 lg:line-clamp-1">{decision.reasoning}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto mt-3 lg:mt-0 pt-3 lg:pt-0 border-t border-border lg:border-t-0">
        <div className="text-left lg:text-right shrink-0">
          <p className="text-[11px] text-text-muted">Stock</p>
          <p className="text-[12px] font-medium">{inventoryItem?.currentStock || 8} / {inventoryItem?.safeStock || 15} {decision.unit}</p>
        </div>

        <div className="shrink-0 max-w-[120px]">
          <p className="text-[11px] text-text-muted">Recommended</p>
          <p className="text-[12px] font-medium truncate">{typeLabel}</p>
          <p className="text-[11px] text-text-muted truncate" title={subtext}>{subtext}</p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-[12px] font-bold text-critical">₹{(decision.revenueAtRisk || 33600).toLocaleString()}</p>
          <p className="text-[10px] text-text-muted">at risk</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        <button 
          onClick={onReview}
          className="px-4 py-1.5 bg-[var(--color-intelligence)] text-white rounded-md text-[12px] font-medium hover:bg-[var(--color-intelligence)]/90 transition-colors"
        >
          Review
        </button>
        <button 
          disabled 
          title="More options unavailable for this decision type" 
          className="p-1.5 text-text-muted transition-colors border border-transparent rounded-md opacity-50 cursor-not-allowed"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function PORow({ id, supplier, value, date, status }: any) {
  return (
    <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-background text-[12px]">
      <div>
        <Link href="/purchase-orders" className="font-semibold text-text-primary hover:underline">{id}</Link>
        <p className="text-text-secondary mt-0.5">{supplier}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold">{value}</p>
        <p className="text-text-muted">Exp: {date}</p>
      </div>
    </div>
  );
}

function TransferRow({ id, route, qty, status }: any) {
  return (
    <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-background text-[12px]">
      <div>
        <Link href="/transfers" className="font-semibold text-text-primary hover:underline">{id}</Link>
        <p className="text-text-secondary mt-0.5">{route}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold">{qty}</p>
        <p className="text-text-muted">{status}</p>
      </div>
    </div>
  );
}

function RiskItemRow({ name, branch, value }: any) {
  return (
    <div className="flex items-center justify-between cursor-pointer group">
      <div>
        <p className="text-[13px] font-medium text-text-primary group-hover:text-[var(--color-intelligence)] transition-colors">{name}</p>
        <p className="text-[11px] text-text-secondary">{branch}</p>
      </div>
      <div className="flex items-center gap-1 text-critical">
        <span className="text-[13px] font-bold">{value}</span>
        <TrendingDown className="w-3 h-3" />
      </div>
    </div>
  );
}

function ActivityRow({ icon, bg, title, text, time }: any) {
  return (
    <div className="flex gap-3 relative z-10">
      <div className={`w-5 h-5 rounded-full ${bg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-[12px] font-medium text-text-primary leading-tight">{title}</p>
        <p className="text-[11px] text-text-secondary mt-0.5">{text}</p>
        <p className="text-[10px] text-text-muted mt-0.5">{time}</p>
      </div>
    </div>
  );
}
