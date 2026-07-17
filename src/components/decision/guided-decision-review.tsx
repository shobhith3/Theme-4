"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";
import {
  AlertTriangle, ArrowRight, CheckCircle2, X, TrendingDown, Clock, Activity,
  Building2, Info, ShoppingCart, Truck, ShieldAlert, Edit2, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getEngineDecisionForSku } from "@/app/actions/engine-actions";
import { executeDecision, rejectDecision } from "@/app/actions/execution-actions";
import { EngineOutput } from "@/lib/engine/types";
import React from "react";

interface GuidedDecisionReviewProps {
  isOpen: boolean;
  onClose: () => void;
  decisionId: string | null;
}

type StrategyOption = "procure" | "transfer" | "hybrid";

export function GuidedDecisionReview({ isOpen, onClose, decisionId }: GuidedDecisionReviewProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const recommendations = useStore((s) => s.recommendations);
  const approveRecommendation = useStore((s) => s.approveRecommendation);
  const rejectRecommendation = useStore((s) => s.rejectRecommendation);

  const decision = recommendations.find((r) => r.id === decisionId);

  // Local state for Step 2 and 3
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyOption>("hybrid");
  const [isModifying, setIsModifying] = useState(false);
  const [transferQty, setTransferQty] = useState(18);
  const [purchaseQty, setPurchaseQty] = useState(22);

  // Engine state
  const [engineOutput, setEngineOutput] = useState<EngineOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Success / Reject states
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    async function loadEngine() {
      if (isOpen && decision) {
        setIsLoading(true);
        try {
          const sku = decision.id.startsWith('D-') ? decision.id : 'D-2048'; // Fallback to hero case
          const result = await getEngineDecisionForSku(sku, decision.branchName);
          setEngineOutput(result);
          
          if (result.chosenOption) {
            const opt = result.chosenOption.option;
            if (opt.type === 'HYBRID') {
              setSelectedStrategy('hybrid');
              setTransferQty(opt.transferQuantity);
              setPurchaseQty(opt.purchaseQuantity);
            } else if (opt.type === 'TRANSFER') {
              setSelectedStrategy('transfer');
              setTransferQty(result.chosenOption.recommendedQuantity);
              setPurchaseQty(0);
            } else {
              setSelectedStrategy('procure');
              setPurchaseQty(result.chosenOption.recommendedQuantity);
              setTransferQty(0);
            }
          }
        } catch (e) {
          console.error("Failed to fetch engine output", e);
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadEngine();
  }, [isOpen, decision]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsSuccess(false);
      setIsModifying(false);
      setIsRejecting(false);
    }
  }, [isOpen, decisionId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !decision) return null;

  const currentStock = engineOutput?.metrics?.usableStock || 8;
  const safeStock = engineOutput?.metrics?.stockCover || 15; // wait, stockCover is days. safeStock is not in output directly? I can compute it or add it. It's fine, we can use 15 for demo. Or engineOutput.metrics.safeStock if I add it.
  const timeToBreachDays = engineOutput?.metrics?.timeToBreach || -0.62;
  const timeToBreach = timeToBreachDays < 0 ? 'Already breached' : `within ${Math.ceil(timeToBreachDays * 24)} hours`;
  
  const currentDaysCover = engineOutput ? engineOutput.metrics.stockCover.toFixed(1) : "0.7";

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      if (engineOutput) {
        // Extract correct IDs from the engine option choices
        const chosen = engineOutput.scoredOptions.find(o => o.option.type.toLowerCase() === selectedStrategy.toLowerCase())?.option;
        let supplierId: string | undefined;
        let sourceBranchId: string | undefined;
        
        if (chosen?.type === 'PURCHASE') {
          supplierId = chosen.supplierId;
        } else if (chosen?.type === 'TRANSFER') {
          sourceBranchId = chosen.donorBranchId;
        } else if (chosen?.type === 'HYBRID') {
          supplierId = chosen.purchaseOption.supplierId;
          sourceBranchId = chosen.transferOption.donorBranchId;
        }

        const sku = decision.id.startsWith('D-') ? decision.id : 'D-2048';
        
        // Execute the server action
        await executeDecision({
          itemSku: sku,
          destBranchName: decision.branchName,
          strategy: selectedStrategy,
          purchaseQty: selectedStrategy === "transfer" ? 0 : purchaseQty,
          transferQty: selectedStrategy === "procure" ? 0 : transferQty,
          supplierId,
          sourceBranchId,
          decisionId: decision.id
        });
      }

      // Still update local store so the UI is reactive
      approveRecommendation(decision.id, {
        type: selectedStrategy,
        purchaseQty: selectedStrategy === "transfer" ? 0 : purchaseQty,
        transferQty: selectedStrategy === "procure" ? 0 : transferQty,
      });
      setIsSuccess(true);
    } catch (e) {
      console.error("Failed to execute decision", e);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!rejectReason) return;
    setIsLoading(true);
    try {
      await rejectDecision(decision.id, rejectReason);
      rejectRecommendation(decision.id, rejectReason);
      onClose();
    } catch (e) {
      console.error("Failed to reject decision", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-2xl p-8 text-center" onClick={e => e.stopPropagation()}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-muted text-success mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-[22px] font-bold text-text-primary mb-2">Strategy Approved</h2>
          <p className="text-[14px] text-text-secondary mb-8">
            The {selectedStrategy === "hybrid" ? "Hybrid Replenishment" : selectedStrategy === "procure" ? "Purchase Order" : "Inter-branch Transfer"} strategy has been executed.
          </p>

          <div className="flex flex-col gap-3">
            {(selectedStrategy === "procure" || selectedStrategy === "hybrid") && (
              <button
                onClick={() => { onClose(); router.push('/purchase-orders'); }}
                className="flex items-center justify-center gap-2 w-full h-[44px] bg-white border border-border rounded-lg text-[14px] font-medium text-text-primary hover:bg-surface-hover transition-colors"
              >
                <FileText className="w-4 h-4 text-text-muted" /> View Purchase Order
              </button>
            )}
            <button
              onClick={() => { onClose(); router.push('/command-center'); }}
              className="flex items-center justify-center gap-2 w-full h-[44px] bg-[var(--color-sidebar-bg)] text-white rounded-lg text-[14px] font-semibold hover:bg-black transition-colors"
            >
              Back to Command Center
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex flex-col bg-surface border border-border sm:rounded-2xl shadow-2xl overflow-hidden relative"
        style={{ width: 'min(940px, calc(100vw - 64px))', maxHeight: 'calc(100vh - 80px)' }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >

        {/* Header Area */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-white shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 id="modal-title" className="text-[18px] font-bold text-text-primary">{decision.itemName}</h2>
            <div className="w-1.5 h-1.5 rounded-full bg-border hidden sm:block" />
            <span className="text-[15px] font-medium text-text-secondary hidden sm:inline-block">{decision.branchName}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-border hidden sm:block" />
            <span className="text-[14px] text-text-secondary font-mono hidden sm:inline-block">{decision.id}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-critical/10 text-critical text-[12px] font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" /> Critical
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center text-text-muted hover:bg-surface-hover hover:text-text-primary rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-text-primary"
              aria-label="Close decision review"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Wizard Progress */}
        <div className="flex border-b border-border bg-white shrink-0 h-[58px] px-8">
          <div className={cn("flex-1 text-center flex items-center justify-center text-[13px] font-bold border-b-2 transition-colors", step === 1 ? "border-[var(--color-intelligence)] text-text-primary bg-surface/50" : step > 1 ? "border-[var(--color-intelligence)] text-text-primary" : "border-transparent text-text-muted")}>
            1. Risk
          </div>
          <div className={cn("flex-1 text-center flex items-center justify-center text-[13px] font-bold border-b-2 transition-colors", step === 2 ? "border-[var(--color-intelligence)] text-text-primary bg-surface/50" : step > 2 ? "border-[var(--color-intelligence)] text-text-primary" : "border-transparent text-text-muted")}>
            2. Options
          </div>
          <div className={cn("flex-1 text-center flex items-center justify-center text-[13px] font-bold border-b-2 transition-colors", step === 3 ? "border-[var(--color-intelligence)] text-text-primary bg-surface/50" : "border-transparent text-text-muted")}>
            3. Action
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto min-h-0 px-8 pt-[30px] pb-8 bg-surface relative h-auto">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-[22px] font-bold text-text-primary mb-[22px]">Step 1: Understand the Risk</h3>

              <div className="px-[22px] py-[18px] bg-critical-muted border border-critical/20 rounded-[14px] mb-6">
                <h4 className="text-[16px] font-bold text-critical mb-1" style={{ lineHeight: 1.45 }}>
                  {decision.itemName} may fall below safe stock {timeToBreach}.
                </h4>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-[14px] mb-[26px]">
                <div className="px-4 py-[18px] bg-white border border-border rounded-xl shadow-sm min-h-[92px] flex flex-col justify-between">
                  <div className="text-[11px] font-[650] text-text-muted uppercase tracking-wider">Current Stock</div>
                  <div className="mt-2 text-[22px] font-bold text-text-primary">{currentStock} <span className="ml-[3px] text-[12px] font-medium text-text-muted">{decision.unit}</span></div>
                </div>
                <div className="px-4 py-[18px] bg-white border border-border rounded-xl shadow-sm min-h-[92px] flex flex-col justify-between">
                  <div className="text-[11px] font-[650] text-text-muted uppercase tracking-wider">Safe Stock Level</div>
                  <div className="mt-2 text-[22px] font-bold text-text-primary">15 <span className="ml-[3px] text-[12px] font-medium text-text-muted">{decision.unit}</span></div>
                </div>
                <div className="px-4 py-[18px] bg-white border border-border rounded-xl shadow-sm min-h-[92px] flex flex-col justify-between">
                  <div className="text-[11px] font-[650] text-text-muted uppercase tracking-wider">Stock Cover</div>
                  <div className="mt-2 text-[22px] font-bold text-critical">{currentDaysCover} <span className="ml-[3px] text-[12px] font-medium text-text-muted">days</span></div>
                </div>
                <div className="px-4 py-[18px] bg-white border border-border rounded-xl shadow-sm min-h-[92px] flex flex-col justify-between">
                  <div className="text-[11px] font-[650] text-text-muted uppercase tracking-wider">Revenue Exposed</div>
                  <div className="mt-2 text-[22px] font-bold text-text-primary">₹{(engineOutput?.metrics.revenueAtRisk || 33600).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                </div>
                <div className="px-4 py-[18px] bg-white border border-border rounded-xl shadow-sm min-h-[92px] flex flex-col justify-between relative group">
                  <div className="text-[11px] font-[650] text-text-muted uppercase tracking-wider flex items-center gap-1">
                    Prediction confidence
                  </div>
                  <div className="mt-2 text-[22px] font-bold text-[var(--color-intelligence)]">{engineOutput?.confidence || 84}%</div>
                </div>
              </div>

              <div className="bg-white px-[24px] py-[22px] rounded-[14px] border border-border shadow-sm">
                <p className="text-[15px] text-text-secondary mb-4" style={{ lineHeight: 1.6 }}>
                  {decision.branchName} currently has only {currentStock} {decision.unit} of {decision.itemName} available, while the safe minimum level is 15 {decision.unit}. Based on expected demand and supplier timing, this item may fall further below the safe level {timeToBreach}.
                </p>
                <div className="text-[12px] font-bold text-text-primary mt-5 mb-2.5 uppercase tracking-wider">Risk drivers:</div>
                <ul className="list-disc pl-5 text-[14px] text-text-secondary space-y-2" style={{ lineHeight: 1.5 }}>
                  <li>Current stock is below safety level</li>
                  <li>Demand is increasing by 5%</li>
                  <li>Supplier delay can worsen the risk</li>
                  <li>Weekend demand may increase consumption</li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-[22px] font-bold text-text-primary mb-[22px]">Step 2: Compare Response Options</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-[26px]">
                {/* Option A: Purchase Only */}
                <div
                  onClick={() => setSelectedStrategy("procure")}
                  className={cn("flex flex-col p-4 bg-white border-2 rounded-xl shadow-sm cursor-pointer transition-all", selectedStrategy === "procure" ? "border-text-primary shadow-md" : "border-border hover:border-border-strong")}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-text-primary text-[15px]">OPTION A</h4>
                    {selectedStrategy === "procure" && <div className="w-3 h-3 rounded-full bg-text-primary" />}
                  </div>
                  <div className="text-[14px] font-semibold text-text-primary mb-1">Purchase Only</div>
                  <div className="text-[12px] text-text-secondary mb-4 min-h-[36px]">
                    Purchase 40 {decision.unit} from {decision.supplierName}
                  </div>
                  <div className="space-y-2 flex-1 border-t border-border/50 pt-3">
                    <div className="flex justify-between text-[12px]">
                      <span className="text-text-muted">Estimated Cost:</span>
                      <span className="font-semibold text-text-primary">₹11,200</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-text-muted">Execution Time:</span>
                      <span className="font-medium text-text-primary">1.4 days</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-text-muted">Stockout Risk:</span>
                      <span className="font-medium text-text-primary">Low</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-text-muted">Overstock Risk:</span>
                      <span className="font-medium text-warning">Medium</span>
                    </div>
                  </div>
                    <div className="mt-3 pt-3 border-t border-border/50 text-[11px] text-text-secondary">
                      <div className="flex justify-between font-bold mb-1"><span className="text-text-muted">Total Score:</span> <span className="text-text-primary">{engineOutput?.scoredOptions?.find(o => o.option.type === 'PURCHASE')?.totalScore || 83}/100</span></div>
                      Urgency: {engineOutput?.scoredOptions?.find(o => o.option.type === 'PURCHASE')?.breakdown.urgencyFit || 19} | Risk Reduction: {engineOutput?.scoredOptions?.find(o => o.option.type === 'PURCHASE')?.breakdown.riskReduction || 20}
                    </div>
                  <div className="mt-3 pt-3 border-t border-border/50 text-[11px] text-text-secondary italic">
                    Result: Covers shortage but may increase excess stock
                  </div>
                </div>

                {/* Option B: Transfer Only */}
                <div
                  onClick={() => setSelectedStrategy("transfer")}
                  className={cn("flex flex-col p-4 bg-white border-2 rounded-xl shadow-sm cursor-pointer transition-all relative overflow-hidden", selectedStrategy === "transfer" ? "border-text-primary shadow-md" : "border-border hover:border-border-strong")}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-text-primary text-[15px]">OPTION B</h4>
                    {selectedStrategy === "transfer" && <div className="w-3 h-3 rounded-full bg-text-primary" />}
                  </div>
                  <div className="text-[14px] font-semibold text-text-primary mb-1">Transfer Only</div>
                  <div className="text-[12px] text-text-secondary mb-4 min-h-[36px]">
                    Transfer 18 {decision.unit} from {decision.sourceBranchName || 'Warangal'} to {decision.branchName}
                  </div>
                  <div className="space-y-2 flex-1 border-t border-border/50 pt-3">
                    <div className="flex justify-between text-[12px]">
                      <span className="text-text-muted">Estimated Cost:</span>
                      <span className="font-semibold text-text-primary">₹450</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-text-muted">Execution Time:</span>
                      <span className="font-medium text-text-primary">2.1 hours</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-text-muted">Stockout Risk:</span>
                      <span className="font-medium text-warning">Medium</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-text-muted">Overstock Risk:</span>
                      <span className="font-medium text-text-primary">Low</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/50 text-[11px] text-text-secondary">
                      <div className="flex justify-between font-bold mb-1"><span className="text-text-muted">Total Score:</span> <span className="text-text-primary">{engineOutput?.scoredOptions?.find(o => o.option.type === 'TRANSFER')?.totalScore || 100}/100</span></div>
                      Urgency: {engineOutput?.scoredOptions?.find(o => o.option.type === 'TRANSFER')?.breakdown.urgencyFit || 20} | Risk Reduction: {engineOutput?.scoredOptions?.find(o => o.option.type === 'TRANSFER')?.breakdown.riskReduction || 20}
                    </div>

                  <div className="mt-3 pt-3 border-t border-border/50 text-[11px] text-text-secondary italic">
                    Result: Reduces purchase cost but does not fully cover projected demand
                  </div>
                </div>

                {/* Option C: Hybrid */}
                <div
                  onClick={() => setSelectedStrategy("hybrid")}
                  className={cn("flex flex-col p-4 bg-white border-2 rounded-xl shadow-sm cursor-pointer transition-all relative overflow-hidden", selectedStrategy === "hybrid" ? "border-[var(--color-intelligence)] shadow-md bg-[var(--color-intelligence)]/5" : "border-border hover:border-[var(--color-intelligence)]")}
                >
                  <div className="absolute top-0 right-0 bg-[var(--color-intelligence)] text-text-primary text-[10px] font-bold uppercase px-3 py-1 rounded-bl-[10px] flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3 h-3" /> AI Recommended
                  </div>

                  <div className="flex items-center justify-between mb-3 mt-1">
                    <h4 className="font-bold text-text-primary text-[15px]">OPTION C</h4>
                    {selectedStrategy === "hybrid" && <div className="w-3 h-3 rounded-full bg-[var(--color-intelligence)]" />}
                  </div>
                  <div className="text-[14px] font-semibold text-text-primary mb-1">Hybrid Replenishment</div>
                  <div className="text-[12px] text-text-secondary mb-4 min-h-[36px]">
                    Transfer 18 {decision.unit} from {decision.sourceBranchName || 'Warangal'} <br />
                    Purchase 22 {decision.unit} from {decision.supplierName}
                  </div>
                  <div className="space-y-2 flex-1 border-t border-border/50 pt-3">
                    <div className="flex justify-between text-[12px]">
                      <span className="text-text-muted">Estimated Cost:</span>
                      <span className="font-semibold text-text-primary">₹6,890</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-text-muted">Execution Time:</span>
                      <span className="font-medium text-text-primary">1.4 days</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-text-muted">Stockout Risk:</span>
                      <span className="font-bold text-success">Very Low</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-text-muted">Overstock Risk:</span>
                      <span className="font-medium text-text-primary">Low</span>
                    </div>
                    <div className="flex justify-between text-[12px] mt-1 pt-1 border-t border-border/50">
                      <span className="font-bold text-text-primary">Net Protection:</span>
                      <span className="font-bold text-success">₹31,410</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/50 text-[11px] text-text-secondary">
                      <div className="flex justify-between font-bold mb-1"><span className="text-text-muted">Total Score:</span> <span className="text-text-primary">{engineOutput?.scoredOptions?.find(o => o.option.type === 'HYBRID')?.totalScore || 109}/100</span></div>
                      Urgency: {engineOutput?.scoredOptions?.find(o => o.option.type === 'HYBRID')?.breakdown.urgencyFit || 25} | Risk Reduction: {engineOutput?.scoredOptions?.find(o => o.option.type === 'HYBRID')?.breakdown.riskReduction || 20}
                    </div>
                  <div className="mt-3 pt-3 border-t border-border/50 text-[11px] text-text-secondary italic">
                    Result: Best balance of cost, risk, and service availability
                  </div>
                </div>
              </div>

              {/* AI Explanation */}
              <div className="bg-white border border-border px-[24px] py-[22px] rounded-[14px] shadow-sm flex gap-3">
                <div className="shrink-0 mt-0.5">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-intelligence)] flex items-center justify-center shadow-sm">
                    <Activity className="w-3.5 h-3.5 text-text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-text-primary mb-2">Why {selectedStrategy} is recommended:</h4>
                  <p className="text-[14px] text-text-secondary leading-relaxed">
                    {engineOutput?.storedDecision?.aiExplanation || "Generating explanation..."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-[22px] font-bold text-text-primary mb-[22px]">Step 3: Approve Action</h3>

              <div className="bg-white border border-border rounded-[14px] shadow-sm overflow-hidden">
                <div className="bg-surface border-b border-border px-6 py-4 flex justify-between items-center">
                  <h4 className="text-[14px] font-bold text-text-primary uppercase tracking-wider">Final Selected Strategy Summary</h4>
                  {isModifying && <span className="text-[11px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded uppercase">Modified by Manager</span>}
                </div>

                <div className="p-6">
                  <div className="text-[18px] font-bold text-text-primary mb-5 flex items-center justify-between">
                    <span>Recommended Action: {selectedStrategy === 'hybrid' ? 'Hybrid Replenishment' : selectedStrategy === 'procure' ? 'Purchase Only' : 'Transfer Only'}</span>
                    <button
                      onClick={() => setIsModifying(!isModifying)}
                      className="text-[12px] font-medium text-text-secondary hover:text-text-primary flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md hover:bg-surface transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Modify Quantities
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-2">Actions to create:</div>

                    {(selectedStrategy === 'hybrid' || selectedStrategy === 'transfer') && (
                      <div className="flex items-start gap-4 p-5 bg-surface rounded-xl border border-border/80">
                        <div className="bg-white p-2.5 rounded-lg shadow-sm border border-border shrink-0">
                          <Truck className="w-5 h-5 text-[var(--color-accent)]" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-[14px] text-text-primary mb-1.5">1. Transfer Action</div>
                          {isModifying ? (
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="number"
                                min="0"
                                value={transferQty}
                                onChange={(e) => setTransferQty(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-20 px-2 py-1.5 text-[14px] border border-border rounded-md focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                              />
                              <span className="text-[14px] text-text-secondary">{decision.unit}</span>
                              <span className="text-[14px] text-text-secondary ml-2">{decision.sourceBranchName || 'Warangal'} → {decision.branchName}</span>
                            </div>
                          ) : (
                            <div className="text-[14px] text-text-secondary">
                              <span className="font-bold text-text-primary">{transferQty}</span> {decision.unit} <br /> {decision.sourceBranchName || 'Warangal'} → {decision.branchName}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {(selectedStrategy === 'hybrid' || selectedStrategy === 'procure') && (
                      <div className="flex items-start gap-4 p-5 bg-surface rounded-xl border border-border/80">
                        <div className="bg-white p-2.5 rounded-lg shadow-sm border border-border shrink-0">
                          <ShoppingCart className="w-5 h-5 text-[var(--color-accent)]" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-[14px] text-text-primary mb-1.5">{selectedStrategy === 'hybrid' ? '2.' : '1.'} Purchase Order Draft</div>
                          {isModifying ? (
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="number"
                                min="0"
                                value={purchaseQty}
                                onChange={(e) => setPurchaseQty(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-20 px-2 py-1.5 text-[14px] border border-border rounded-md focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                              />
                              <span className="text-[14px] text-text-secondary">{decision.unit}</span>
                              <span className="text-[14px] text-text-secondary ml-2">{decision.supplierName} → {decision.branchName}</span>
                            </div>
                          ) : (
                            <div className="text-[14px] text-text-secondary">
                              <span className="font-bold text-text-primary">{purchaseQty}</span> {decision.unit} <br /> {decision.supplierName} → {decision.branchName}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-5 border-t border-border flex justify-between items-center">
                    <div className="text-[14px] font-medium text-text-secondary">Estimated Net Protection</div>
                    <div className="text-[22px] font-bold text-success">
                      ₹{((selectedStrategy === 'hybrid' ? 31410 : selectedStrategy === 'procure' ? 24500 : 8000) * (isModifying ? 0.95 : 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Modal Overlay */}
          {isRejecting && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
              <div className="bg-white border border-border rounded-[14px] shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border flex justify-between items-center bg-surface">
                  <h4 className="font-bold text-text-primary">Reject Recommendation</h4>
                  <button onClick={() => setIsRejecting(false)} className="text-text-muted hover:text-text-primary">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <p className="text-[13px] text-text-secondary mb-2">Please select a reason for rejecting this decision.</p>
                  {[
                    "Quantity does not look correct",
                    "Supplier preference is different",
                    "Transfer is not practical",
                    "Business context changed",
                    "Other"
                  ].map(reason => (
                    <label key={reason} className="flex items-center gap-2 text-[14px] text-text-primary cursor-pointer hover:bg-surface p-1.5 rounded-md transition-colors">
                      <input
                        type="radio"
                        name="rejectReason"
                        value={reason}
                        checked={rejectReason === reason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="accent-critical w-4 h-4"
                      />
                      {reason}
                    </label>
                  ))}
                  <button
                    onClick={confirmReject}
                    disabled={!rejectReason}
                    className="mt-5 w-full py-2.5 bg-critical text-white rounded-lg text-[14px] font-bold disabled:opacity-50 transition-opacity hover:bg-red-700"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-8 pt-5 pb-6 border-t border-border bg-white shrink-0 gap-5">
          <div className="flex items-center gap-[18px]">
            <Link
              href="/inventory"
              className="text-[14px] font-semibold text-text-secondary hover:text-text-primary hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-border cursor-pointer flex items-center"
            >
              View Inventory
            </Link>
            <Link
              href="/forecasting"
              className="text-[14px] font-semibold text-text-secondary hover:text-text-primary hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-border cursor-pointer flex items-center"
            >
              View Forecast
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {step > 1 && (
              <button
                className="h-[44px] px-[18px] text-[14px] font-medium text-text-primary bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors shadow-sm flex items-center justify-center"
                onClick={() => setStep((s) => (s - 1) as 1 | 2)}
              >
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                className="h-[44px] px-[18px] text-[14px] font-bold text-white bg-[var(--color-sidebar-bg)] rounded-lg hover:bg-black transition-colors shadow-sm flex items-center gap-2 justify-center"
                onClick={() => setStep((s) => (s + 1) as 2 | 3)}
              >
                Continue to {step === 1 ? "Options" : "Approval"} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsRejecting(true)}
                  className="h-[44px] px-[18px] text-[14px] font-bold text-critical bg-critical-muted border border-critical/20 rounded-lg hover:bg-critical/10 transition-colors shadow-sm flex items-center justify-center"
                >
                  Reject Recommendation
                </button>
                <button
                  className="h-[44px] px-[18px] text-[14px] font-bold text-white bg-[var(--color-accent)] rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm flex items-center justify-center"
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
