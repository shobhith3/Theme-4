"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, X, TrendingDown, Clock, Activity, Building2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuidedDecisionReviewProps {
  isOpen: boolean;
  onClose: () => void;
  decisionId: string | null;
}

export function GuidedDecisionReview({ isOpen, onClose, decisionId }: GuidedDecisionReviewProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const recommendations = useStore((s) => s.recommendations);
  const approveRecommendation = useStore((s) => s.approveRecommendation);
  const rejectRecommendation = useStore((s) => s.rejectRecommendation);
  const inventory = useStore((s) => s.inventory);
  
  const decision = recommendations.find((r) => r.id === decisionId);
  const itemInventory = inventory.find(i => i.id === decision?.itemId && i.branchId === decision?.branchId);
  
  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  if (!isOpen || !decision) return null;

  const handleApprove = () => {
    approveRecommendation(decision.id);
    onClose();
  };

  const handleReject = () => {
    rejectRecommendation(decision.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-[700px] bg-surface border border-border sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header Area */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10">
              <Activity className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Decision Review</h2>
              <p className="text-xs text-text-secondary">{decision.itemName} • {decision.branchName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:bg-surface-hover rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Progress */}
        <div className="flex border-b border-border bg-surface shrink-0">
          <div className={cn("flex-1 text-center py-3 text-[13px] font-medium border-b-2 transition-colors", step >= 1 ? "border-[var(--color-accent)] text-[var(--color-accent)]" : "border-transparent text-text-muted")}>
            1. Understand Risk
          </div>
          <div className={cn("flex-1 text-center py-3 text-[13px] font-medium border-b-2 transition-colors", step >= 2 ? "border-[var(--color-accent)] text-[var(--color-accent)]" : "border-transparent text-text-muted")}>
            2. Compare Options
          </div>
          <div className={cn("flex-1 text-center py-3 text-[13px] font-medium border-b-2 transition-colors", step >= 3 ? "border-[var(--color-accent)] text-[var(--color-accent)]" : "border-transparent text-text-muted")}>
            3. Approve Action
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface">
          
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-start gap-4 p-4 bg-critical-muted border border-critical/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-critical shrink-0 mt-1" />
                <div>
                  <h3 className="text-[16px] font-semibold text-critical mb-1">Safety stock breach in {decision.timeToBreach || "46 hours"}</h3>
                  <p className="text-[14px] text-text-secondary leading-relaxed">
                    Based on current stock, weekend demand uplift, and supplier lead time, this item is expected to fall below the safety threshold before the next normal replenishment window.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white border border-border rounded-lg shadow-sm">
                  <div className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1">Financial Exposure</div>
                  <div className="text-[20px] font-bold text-text-primary">₹{(decision.estimatedCost + decision.estimatedSavings).toLocaleString()}</div>
                </div>
                <div className="p-4 bg-white border border-border rounded-lg shadow-sm">
                  <div className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1">Current Stock</div>
                  <div className="text-[20px] font-bold text-text-primary">{itemInventory?.currentStock || 0} {decision.unit}</div>
                </div>
                <div className="p-4 bg-white border border-border rounded-lg shadow-sm">
                  <div className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1">Safety Stock</div>
                  <div className="text-[20px] font-bold text-text-primary">{itemInventory?.minStock || 0} {decision.unit}</div>
                </div>
                <div className="p-4 bg-white border border-border rounded-lg shadow-sm relative group cursor-help">
                  <div className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                    Prediction Confidence <Info className="w-3 h-3" />
                  </div>
                  <div className="text-[20px] font-bold text-text-primary">{decision.confidenceScore}%</div>
                  {/* Tooltip */}
                  <div className="absolute top-full left-0 mt-2 w-48 p-2 bg-text-primary text-white text-[11px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    This score shows how reliable the forecast is based on available sales and inventory data.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <p className="text-[14px] text-text-secondary">
                Review the available response options. The AI has recommended a strategy based on cost, distance, and supplier reliability.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Option A: Purchase Only */}
                <div className={cn("flex flex-col p-4 bg-white border rounded-lg shadow-sm opacity-60", decision.type === "procure" ? "border-[var(--color-accent)] opacity-100 ring-1 ring-[var(--color-accent)]" : "border-border")}>
                  {decision.type === "procure" && (
                    <div className="text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-wider mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> AI Recommended
                    </div>
                  )}
                  <h4 className="font-semibold text-text-primary mb-3">OPTION A: Purchase Only</h4>
                  <div className="space-y-3 flex-1">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-text-muted">Estimated Cost:</span>
                      <span className="font-medium">₹11,200</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-text-muted">Time to Execute:</span>
                      <span className="font-medium">24 hrs</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border">
                    <div className="text-[12px] font-medium text-text-secondary">Supplier: {decision.supplierName}</div>
                  </div>
                </div>

                {/* Option B: Transfer Only */}
                <div className={cn("flex flex-col p-4 bg-white border rounded-lg shadow-sm opacity-60", decision.type === "transfer" ? "border-[var(--color-accent)] opacity-100 ring-1 ring-[var(--color-accent)]" : "border-border")}>
                   {decision.type === "transfer" && (
                    <div className="text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-wider mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> AI Recommended
                    </div>
                  )}
                  <h4 className="font-semibold text-text-primary mb-3">OPTION B: Transfer Only</h4>
                   <div className="space-y-3 flex-1">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-text-muted">Transfer Cost:</span>
                      <span className="font-medium">₹{decision.transferFeasibility?.transferCost || 450}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-text-muted">Travel Time:</span>
                      <span className="font-medium">{decision.transferFeasibility?.travelTimeHours || 2.1} hrs</span>
                    </div>
                  </div>
                   <div className="mt-4 pt-3 border-t border-border">
                     {decision.transferFeasibility ? (
                        <div className={cn("text-[12px] font-medium", decision.transferFeasibility.feasible ? "text-success" : "text-critical")}>
                          Transfer {decision.transferFeasibility.feasible ? "Recommended" : "Not Recommended"}
                        </div>
                     ) : (
                       <div className="text-[12px] font-medium text-critical">Transfer Not Recommended</div>
                     )}
                  </div>
                </div>

                {/* Option C: Hybrid */}
                <div className={cn("flex flex-col p-4 bg-white border rounded-lg shadow-sm opacity-60", decision.type === "hybrid" ? "border-[var(--color-accent)] opacity-100 ring-1 ring-[var(--color-accent)] bg-[#F6FAF8]" : "border-border")}>
                   {decision.type === "hybrid" && (
                    <div className="text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-wider mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> AI Recommended
                    </div>
                  )}
                  <h4 className="font-semibold text-text-primary mb-3">OPTION C: Hybrid</h4>
                  <div className="space-y-3 flex-1">
                     <p className="text-[12px] text-text-secondary group relative cursor-help">
                        Use some available stock from another branch and purchase only the remaining required quantity.
                     </p>
                    <div className="flex justify-between text-[13px] pt-2">
                      <span className="text-text-muted">Est. Protection:</span>
                      <span className="font-medium">₹{((decision.estimatedCost || 0) + (decision.estimatedSavings || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {decision.transferFeasibility && (
                <div className="p-4 bg-white border border-border rounded-lg shadow-sm">
                  <h4 className="text-[13px] font-semibold text-text-primary mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-text-muted" />
                    Transfer Feasibility: {decision.transferFeasibility.feasible ? "Recommended" : "Not Recommended"}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-[11px] text-text-muted uppercase">Distance</div>
                      <div className="text-[14px] font-medium text-text-primary">{decision.transferFeasibility.distanceKm} km</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted uppercase">Travel Time</div>
                      <div className="text-[14px] font-medium text-text-primary">{decision.transferFeasibility.travelTimeHours} hrs</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted uppercase">Transfer Cost</div>
                      <div className="text-[14px] font-medium text-text-primary">₹{decision.transferFeasibility.transferCost}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted uppercase">Purchase Avoided</div>
                      <div className="text-[14px] font-medium text-text-primary">₹{decision.transferFeasibility.purchaseAvoided}</div>
                    </div>
                  </div>
                  <p className="text-[13px] text-text-secondary bg-surface p-2.5 rounded border border-border">
                    <span className="font-medium text-text-primary">Reason: </span>
                    {decision.transferFeasibility.reason}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success-muted text-success mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-[20px] font-bold text-text-primary">Recommended Action: {decision.type === 'hybrid' ? 'Hybrid Replenishment' : decision.type === 'transfer' ? 'Inter-branch Transfer' : 'Purchase Order'}</h3>
                <p className="text-[14px] text-text-secondary mt-1">Review and approve the actions to be created.</p>
              </div>

              <div className="bg-white border border-border rounded-lg shadow-sm p-5 space-y-4">
                <h4 className="text-[14px] font-semibold text-text-primary uppercase tracking-wider mb-2">Actions to Create</h4>
                
                {(decision.type === 'hybrid' || decision.type === 'transfer') && decision.sourceBranchName && (
                  <div className="flex items-start gap-3 p-3 bg-surface rounded-md border border-border">
                     <ArrowRight className="w-5 h-5 text-text-muted mt-0.5" />
                     <div>
                       <div className="font-medium text-[14px] text-text-primary">1. Transfer Action</div>
                       <div className="text-[13px] text-text-secondary">
                         {decision.hybridDetails?.transferQty || decision.suggestedQty} {decision.unit} from {decision.sourceBranchName} to {decision.branchName}
                       </div>
                     </div>
                  </div>
                )}

                {(decision.type === 'hybrid' || decision.type === 'procure') && decision.supplierName && (
                  <div className="flex items-start gap-3 p-3 bg-surface rounded-md border border-border">
                     <TrendingDown className="w-5 h-5 text-text-muted mt-0.5" />
                     <div>
                       <div className="font-medium text-[14px] text-text-primary">{decision.type === 'hybrid' ? '2.' : '1.'} Purchase Order Draft</div>
                       <div className="text-[13px] text-text-secondary">
                         {decision.hybridDetails?.purchaseQty || decision.suggestedQty} {decision.unit} from {decision.supplierName}
                       </div>
                     </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-white shrink-0">
          <button 
            className="px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button 
                className="px-4 py-2 text-[13px] font-medium text-text-primary bg-surface border border-border rounded hover:bg-surface-hover transition-colors shadow-sm"
                onClick={() => setStep((s) => (s - 1) as 1 | 2)}
              >
                Back
              </button>
            )}
            
            {step < 3 ? (
              <button 
                className="px-5 py-2 text-[13px] font-medium text-white bg-[var(--color-accent)] rounded hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm"
                onClick={() => setStep((s) => (s + 1) as 2 | 3)}
              >
                Continue to {step === 1 ? "Options" : "Approval"}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  className="px-4 py-2 text-[13px] font-medium text-text-primary bg-surface border border-border rounded hover:bg-surface-hover transition-colors shadow-sm"
                >
                  Modify Quantities
                </button>
                <button 
                  onClick={handleReject}
                  className="px-4 py-2 text-[13px] font-medium text-critical bg-critical-muted rounded hover:bg-critical/20 transition-colors shadow-sm"
                >
                  Reject
                </button>
                <button 
                  className="px-5 py-2 text-[13px] font-medium text-white bg-[var(--color-accent)] rounded hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm"
                  onClick={handleApprove}
                >
                  Approve Strategy
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
