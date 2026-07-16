"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { useStore } from "@/store/useStore";
import { useState, useMemo } from "react";
import { GuidedDecisionReview } from "@/components/decision/guided-decision-review";
import { AlertTriangle, TrendingDown, RefreshCcw, PackageX, ShieldAlert, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Recommendation } from "@/types";

export default function CommandCenterPage() {
  const recommendations = useStore((s) => s.recommendations);
  const inventory = useStore((s) => s.inventory);
  const approveRecommendation = useStore((s) => s.approveRecommendation);
  const suppliers = useStore((s) => s.suppliers);

  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);

  const pendingDecisions = useMemo(() => {
    return recommendations.filter(r => r.status === "new" || r.status === "needs_review");
  }, [recommendations]);

  // Derived metrics for summary cards
  const needsReviewCount = pendingDecisions.length;
  const revenueAtRisk = pendingDecisions.reduce((acc, r) => acc + (r.revenueAtRisk || 0), 0);
  
  const autoApprovedCount = recommendations.filter(r => r.status === "approved" && r.reasoning?.toLowerCase().includes("auto")).length || 42; // Mocking auto-approved as 42 per prompt if none
  const wasteAvoided = 18500; // Mocked per spec "Waste / Overstock Risk Avoided: ₹18,500"
  const supplierIssues = suppliers.filter(s => s.reliabilityScore < 90).length || 3; // Mocked per spec if zero

  return (
    <PageContainer>
      <PageHeader
        title="Today’s Procurement Decisions"
        description="ProcureIQ monitors inventory, suppliers, branch demand, and stock movement to surface only the decisions that need attention."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-surface border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-text-secondary mb-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-[13px] font-medium">Needs Review</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{needsReviewCount}</p>
        </div>

        <div className="bg-surface border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-text-secondary mb-2">
            <TrendingDown className="w-4 h-4 text-critical" />
            <span className="text-[13px] font-medium">Revenue at Risk</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            ₹{revenueAtRisk.toLocaleString()}
          </p>
        </div>

        <div className="bg-surface border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-text-secondary mb-2">
            <RefreshCcw className="w-4 h-4 text-[var(--color-intelligence)]" />
            <span className="text-[13px] font-medium leading-tight">Auto-Approved Routine Actions</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{autoApprovedCount}</p>
        </div>

        <div className="bg-surface border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-text-secondary mb-2">
            <PackageX className="w-4 h-4 text-success" />
            <span className="text-[13px] font-medium leading-tight">Waste / Overstock Risk Avoided</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">₹{wasteAvoided.toLocaleString()}</p>
        </div>

        <div className="bg-surface border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-text-secondary mb-2">
            <ShieldAlert className="w-4 h-4 text-warning" />
            <span className="text-[13px] font-medium">Supplier Issues</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{supplierIssues}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hidden">
        <input 
          type="text" 
          placeholder="Search..." 
          className="h-[36px] px-3 bg-surface border border-border rounded-md text-[13px] min-w-[200px]" 
        />
        <select className="h-[36px] px-3 bg-surface border border-border rounded-md text-[13px]">
          <option>All Branches</option>
          <option>Hyderabad Central</option>
        </select>
        <select className="h-[36px] px-3 bg-surface border border-border rounded-md text-[13px]">
          <option>All Priorities</option>
          <option>Critical</option>
        </select>
        <select className="h-[36px] px-3 bg-surface border border-border rounded-md text-[13px]">
          <option>Status: Needs Review</option>
        </select>
        <select className="h-[36px] px-3 bg-surface border border-border rounded-md text-[13px]">
          <option>All Actions</option>
          <option>Hybrid</option>
        </select>
        
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[12px] text-text-muted whitespace-nowrap">Showing {pendingDecisions.length} critical decisions</span>
        </div>
      </div>

      {/* Active Filter Chips */}
      <div className="flex items-center gap-2 mb-6">
        <div className="px-2.5 py-1 bg-surface border border-border rounded-full text-[12px] font-medium flex items-center gap-2">
          Priority: Critical <button className="text-text-muted hover:text-text-primary">&times;</button>
        </div>
        <div className="px-2.5 py-1 bg-surface border border-border rounded-full text-[12px] font-medium flex items-center gap-2">
          Status: Needs Review <button className="text-text-muted hover:text-text-primary">&times;</button>
        </div>
        <button className="text-[12px] text-[var(--color-intelligence)] font-medium ml-2">Clear All</button>
      </div>

      {/* Decision Queue */}
      <div className="flex flex-col gap-4">
        {pendingDecisions.map((decision) => (
          <DecisionCard 
            key={decision.id} 
            decision={decision} 
            inventoryItem={inventory.find(i => i.id === decision.itemId && i.branchId === decision.branchId)}
            onReview={() => setSelectedDecisionId(decision.id)}
            onApprove={() => approveRecommendation(decision.id)}
          />
        ))}
        {pendingDecisions.length === 0 && (
          <div className="text-center py-12 text-text-secondary">
            No decisions need your attention today!
          </div>
        )}
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

function DecisionCard({ decision, inventoryItem, onReview, onApprove }: { decision: Recommendation, inventoryItem?: any, onReview: () => void, onApprove: () => void }) {
  const typeLabel = decision.type === 'hybrid' ? 'Hybrid Replenishment' : decision.type === 'procure' ? 'Purchase Order' : decision.type === 'transfer' ? 'Branch Transfer' : 'Stock Adjustment';
  
  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        
        {/* Left Col: Core Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[18px] font-bold text-text-primary">{decision.itemName}</h3>
            <span className="text-[13px] font-medium text-text-secondary px-2 py-0.5 bg-surface-hover rounded-md border border-border">
              {decision.branchName}
            </span>
          </div>
          
          <div className="text-[14px] text-critical font-medium mb-4 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Risk: May breach safe stock within {decision.timeToBreach || "46 hours"}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Current Stock</p>
              <p className="text-[15px] font-bold">{inventoryItem?.currentStock || 8} {decision.unit}</p>
            </div>
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Safe Stock Level</p>
              <p className="text-[15px] font-bold">{inventoryItem?.safeStockLevel || 15} {decision.unit}</p>
            </div>
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Revenue at Risk</p>
              <p className="text-[15px] font-bold text-critical">₹{(decision.revenueAtRisk || 33600).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Right Col: Action & Recommendation */}
        <div className="flex-1 md:max-w-md bg-surface-hover p-4 rounded-lg border border-border">
          <p className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Recommended Action</p>
          <p className="text-[15px] font-bold text-text-primary mb-3">{typeLabel}</p>
          
          <div className="text-[13px] text-text-secondary mb-4 space-y-1">
            {decision.type === 'hybrid' && (
              <>
                <p>• Transfer {decision.hybridDetails?.transferQty} {decision.unit} from {decision.sourceBranchName || 'Warangal'}</p>
                <p>• Purchase {decision.hybridDetails?.purchaseQty} {decision.unit} from {decision.supplierName || 'FreshRoute Foods'}</p>
              </>
            )}
            {decision.type === 'transfer' && (
              <p>• Transfer {decision.suggestedQty} {decision.unit} from {decision.sourceBranchName || 'Warangal'}</p>
            )}
            {decision.type === 'procure' && (
              <p>• Purchase {decision.suggestedQty} {decision.unit} from {decision.supplierName || 'FreshRoute Foods'}</p>
            )}
          </div>

          <p className="text-[13px] text-text-muted leading-relaxed mb-5 line-clamp-3">
            <span className="font-semibold text-text-secondary">Why: </span>
            {decision.reasoning || "Transfer alone is not enough. Purchase alone may create unnecessary excess stock. Hybrid gives the best balance of cost, speed, and availability."}
          </p>

          <div className="flex items-center gap-3">
            <button 
              onClick={onReview}
              className="flex-1 h-[36px] bg-[var(--color-intelligence)] text-white rounded-md text-[13px] font-medium hover:bg-black transition-colors shadow-sm"
            >
              Review
            </button>
            <button 
              onClick={onApprove}
              className="flex items-center justify-center h-[36px] px-4 bg-surface border border-border rounded-md text-[13px] font-medium text-text-primary hover:bg-surface-hover transition-colors shadow-sm"
            >
              <Check className="w-4 h-4 text-success mr-1.5" />
              Approve
            </button>
            <Link 
              href="/inventory"
              className="flex items-center justify-center w-[36px] h-[36px] bg-surface border border-border rounded-md text-text-secondary hover:text-text-primary transition-colors shadow-sm"
              title="View Inventory"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
