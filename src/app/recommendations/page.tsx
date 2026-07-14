"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { ConfidenceBadge } from "@/components/common/confidence-badge";
import { StatusBadge } from "@/components/common/status-badge";
import { useStore } from "@/store/useStore";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect, Suspense } from "react";
import { Recommendation } from "@/types";
import { GuidedDecisionReview } from "@/components/decision/guided-decision-review";
import { Activity, ChevronDown } from "lucide-react";

function RecommendationsContent() {
  const recommendations = useStore(s => s.recommendations);
  const approveRecommendation = useStore(s => s.approveRecommendation);
  const rejectRecommendation = useStore(s => s.rejectRecommendation);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialId = searchParams.get("id");
  const [activeTab, setActiveTab] = useState<Recommendation['status']>("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAdvancedView, setIsAdvancedView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Switch tab if incoming initialId belongs to a different status
  useEffect(() => {
    if (initialId) {
      const rec = recommendations.find(r => r.id === initialId);
      if (rec) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveTab(rec.status);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedId(rec.id);
        // Launch modal immediately in simple mode
        if (!isAdvancedView) {
          setIsModalOpen(true);
          // clear query param so it doesn't reopen on refresh
          router.replace('/recommendations');
        }
      }
    }
  }, [initialId, recommendations, router, isAdvancedView]);

  const filteredRecs = useMemo(() => {
    return recommendations.filter(r => r.status === activeTab).sort((a, b) => {
      // rough sort: critical first
      if (a.urgency === 'critical' && b.urgency !== 'critical') return -1;
      if (b.urgency === 'critical' && a.urgency !== 'critical') return 1;
      return 0;
    });
  }, [recommendations, activeTab]);

  const selectedRec = filteredRecs.find(r => r.id === selectedId) || null;

  const handleSelectDecision = (id: string) => {
    setSelectedId(id);
    if (!isAdvancedView) {
      setIsModalOpen(true);
    }
  };

  const handleApprove = (id: string) => {
    approveRecommendation(id);
  };

  const handleReject = (id: string) => {
    rejectRecommendation(id);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Decision Center" 
          description="Review AI-generated procurement strategies ranked by urgency and business impact." 
        />
        <button
          onClick={() => setIsAdvancedView(!isAdvancedView)}
          className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover border border-border rounded-full text-[13px] font-medium text-text-secondary transition-colors"
        >
          <Activity className="w-4 h-4" />
          {isAdvancedView ? "Hide full analysis" : "View full analysis"}
          <ChevronDown className={`w-4 h-4 transition-transform ${isAdvancedView ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div className="flex items-center gap-6 border-b border-border mb-6">
        <button 
          onClick={() => { setActiveTab("pending"); setSelectedId(null); }}
          className={`pb-3 text-[14px] ${activeTab === 'pending' ? 'font-bold text-text-primary border-b-2 border-[var(--color-intelligence)]' : 'font-medium text-text-secondary hover:text-text-primary transition-colors border-b-2 border-transparent'}`}
        >
          Needs Attention
        </button>
        <button 
          onClick={() => { setActiveTab("approved"); setSelectedId(null); }}
          className={`pb-3 text-[14px] ${activeTab === 'approved' ? 'font-bold text-text-primary border-b-2 border-[var(--color-intelligence)]' : 'font-medium text-text-secondary hover:text-text-primary transition-colors border-b-2 border-transparent'}`}
        >
          Approved
        </button>
        <button 
          onClick={() => { setActiveTab("rejected"); setSelectedId(null); }}
          className={`pb-3 text-[14px] ${activeTab === 'rejected' ? 'font-bold text-text-primary border-b-2 border-[var(--color-intelligence)]' : 'font-medium text-text-secondary hover:text-text-primary transition-colors border-b-2 border-transparent'}`}
        >
          Rejected
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Decision List */}
        <div className={`flex flex-col gap-4 w-full ${isAdvancedView ? 'lg:w-1/2 xl:w-2/5' : ''} max-h-[800px] overflow-y-auto pr-2`}>
          {filteredRecs.length > 0 ? filteredRecs.map((decision) => (
            <div 
              key={decision.id}
              onClick={() => handleSelectDecision(decision.id)}
              className={`flex flex-col p-[20px] bg-white border rounded-[12px] cursor-pointer transition-colors ${selectedRec?.id === decision.id ? 'border-[var(--color-intelligence)] shadow-sm' : 'border-border shadow-sm hover:border-border-strong'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <StatusBadge status={decision.urgency === 'critical' ? 'Critical' : decision.urgency === 'high' ? 'High' : 'Monitored'} />
                {decision.status === 'pending' && <span className="text-[12px] font-medium text-text-muted">{decision.timeToBreach || 'Monitor'}</span>}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[18px] font-bold text-text-primary mb-1">{decision.itemName}</h3>
                  <span className="text-[13px] text-text-secondary mb-4 block">{decision.branchName}</span>
                </div>
                {!isAdvancedView && decision.status === 'pending' && (
                  <button className="px-4 py-2 bg-[var(--color-accent)] text-white text-[13px] font-medium rounded-md shadow-sm">
                    Review Decision
                  </button>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-border/60">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">Impact</span>
                  <span className="text-[14px] font-bold text-text-primary tabular-nums">
                    ₹{((decision.estimatedSavings || 0) + (decision.estimatedCost || 0)).toLocaleString()}
                  </span>
                </div>
                <ConfidenceBadge score={decision.confidenceScore} />
              </div>
            </div>
          )) : (
            <div className="p-8 text-center bg-white border border-border rounded-xl text-text-muted text-[13px]">
              No {activeTab} decisions found.
            </div>
          )}
        </div>

        {/* Active Decision Detail (Advanced View) */}
        {isAdvancedView && selectedRec && (
          <div className="flex flex-col w-full lg:w-1/2 xl:w-3/5 bg-white border border-border rounded-[16px] shadow-sm overflow-hidden h-fit animate-in fade-in slide-in-from-right-4">
            <div className="p-[24px] border-b border-border">
              <h2 className="text-[24px] font-bold text-text-primary mb-2">{selectedRec.itemName} — {selectedRec.branchName}</h2>
              <p className="text-[14px] text-text-secondary">
                {selectedRec.reasoning} 
                {selectedRec.status === 'approved' && <span className="text-[var(--color-intelligence)] font-bold ml-2">(Approved)</span>}
                {selectedRec.status === 'rejected' && <span className="text-critical font-bold ml-2">(Rejected)</span>}
              </p>
            </div>
            
            <div className="flex flex-col bg-surface/30 p-[24px] gap-6">
              
              {/* Strategy Option A */}
              <div className="flex flex-col bg-white border border-[var(--color-intelligence)] rounded-[12px] p-[20px] shadow-sm relative">
                <div className="absolute top-0 right-0 bg-[var(--color-intelligence)] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-bl-[12px] rounded-tr-[11px]">
                  AI Recommended
                </div>
                <h3 className="text-[16px] font-bold text-text-primary mb-4 capitalize">{selectedRec.type} Strategy</h3>
                
                <div className="grid grid-cols-2 gap-y-4 mb-4">
                  <div>
                    <span className="block text-[11px] font-semibold text-text-muted uppercase mb-1">Actions</span>
                    <span className="block text-[13px] font-medium text-text-primary">
                      {selectedRec.type === 'transfer' ? `Transfer ${selectedRec.suggestedQty} ${selectedRec.unit} from ${selectedRec.sourceBranchName || 'another branch'}` :
                       selectedRec.type === 'reduce' ? `Reduce next order by ${selectedRec.suggestedQty} ${selectedRec.unit}` :
                       selectedRec.type === 'hybrid' ? `Transfer ${selectedRec.hybridDetails?.transferQty} & Purchase ${selectedRec.hybridDetails?.purchaseQty}` :
                       `Consolidate supplier order`}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-text-muted uppercase mb-1">Net Financial Impact</span>
                    <span className="block text-[14px] font-bold text-text-primary">
                      {selectedRec.estimatedSavings ? `₹${selectedRec.estimatedSavings.toLocaleString()} Saved` : `₹${selectedRec.estimatedCost?.toLocaleString()} Cost`}
                    </span>
                  </div>
                </div>

                {selectedRec.status === 'pending' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                    <button 
                      onClick={() => handleApprove(selectedRec.id)}
                      className="flex-1 h-[40px] bg-[var(--color-sidebar-bg)] text-white rounded-[8px] text-[13px] font-medium hover:bg-black transition-colors"
                    >
                      Approve Strategy
                    </button>
                    <button 
                      onClick={() => handleReject(selectedRec.id)}
                      className="h-[40px] px-[16px] bg-white border border-border rounded-[8px] text-[13px] font-medium text-critical hover:bg-red-50 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>

      <GuidedDecisionReview
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        decisionId={selectedId}
      />
    </>
  );
}

export default function RecommendationsPage() {
  return (
    <PageContainer>
      <Suspense fallback={<div className="p-8 text-center text-text-muted">Loading recommendations...</div>}>
        <RecommendationsContent />
      </Suspense>
    </PageContainer>
  );
}
