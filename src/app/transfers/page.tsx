"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { useStore } from "@/store/useStore";
import { useState, useMemo } from "react";
import { Truck, Package, Clock, CheckCircle2, ArrowRight } from "lucide-react";

export default function TransfersPage() {
  const transfers = useStore(s => s.transfers);
  const dispatchTransferOrder = useStore(s => s.dispatchTransferOrder);
  const receiveTransferOrder = useStore(s => s.receiveTransferOrder);

  const [activeTab, setActiveTab] = useState<"pending" | "in_transit" | "completed">("pending");

  const filteredTransfers = useMemo(() => {
    switch (activeTab) {
      case "pending": return transfers.filter(t => t.status === "approved" || t.status === "draft");
      case "in_transit": return transfers.filter(t => t.status === "dispatched" || t.status === "in_transit");
      case "completed": return transfers.filter(t => t.status === "received");
      default: return transfers;
    }
  }, [transfers, activeTab]);

  return (
    <PageContainer>
      <PageHeader
        title="Inter-Branch Transfers"
        description="Monitor and manage stock moving between your locations."
      />

      <div className="flex items-center gap-6 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-3 text-[14px] font-bold transition-colors border-b-2 flex items-center gap-2 ${activeTab === "pending" ? "text-text-primary border-[var(--color-accent)]" : "text-text-muted border-transparent hover:text-text-primary"}`}
        >
          <Clock className="w-4 h-4" />
          Pending / Draft
        </button>
        <button
          onClick={() => setActiveTab("in_transit")}
          className={`pb-3 text-[14px] font-bold transition-colors border-b-2 flex items-center gap-2 ${activeTab === "in_transit" ? "text-text-primary border-[var(--color-accent)]" : "text-text-muted border-transparent hover:text-text-primary"}`}
        >
          <Truck className="w-4 h-4" />
          In Transit
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`pb-3 text-[14px] font-bold transition-colors border-b-2 flex items-center gap-2 ${activeTab === "completed" ? "text-text-primary border-[var(--color-accent)]" : "text-text-muted border-transparent hover:text-text-primary"}`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Completed
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTransfers.length === 0 ? (
          <div className="p-12 text-center border border-border rounded-xl bg-white flex flex-col items-center justify-center">
            <Package className="w-12 h-12 text-text-muted mb-4 opacity-50" />
            <p className="text-text-secondary text-[14px]">No {activeTab.replace("_", " ")} transfers right now.</p>
          </div>
        ) : (
          filteredTransfers.map(transfer => (
            <div key={transfer.id} className="bg-white border border-border rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[12px] font-bold px-2 py-1 bg-surface border border-border rounded-md text-text-muted uppercase tracking-wider">
                    TRN-{transfer.id.slice(0,6).toUpperCase()}
                  </span>
                  <h3 className="text-[16px] font-bold text-text-primary">{transfer.itemName}</h3>
                  <span className="text-[14px] font-medium text-text-secondary">
                    {transfer.quantity} {transfer.unit}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-[13px] text-text-secondary mt-3">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">From</span>
                    <span className="font-medium text-text-primary">{transfer.sourceBranchName}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-muted mt-4" />
                  <div className="flex flex-col">
                    <span className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">To</span>
                    <span className="font-medium text-text-primary">{transfer.destinationBranchName}</span>
                  </div>
                  
                  <div className="ml-8 flex flex-col border-l border-border pl-4">
                    <span className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">Expected Arrival</span>
                    <span className="font-medium text-text-primary">{new Date(transfer.expectedArrivalDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {activeTab === "pending" && (
                  <button 
                    onClick={() => dispatchTransferOrder(transfer.id)}
                    className="h-[36px] px-4 bg-[var(--color-accent)] text-white rounded-md text-[13px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm flex items-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    Dispatch Now
                  </button>
                )}
                {activeTab === "in_transit" && (
                  <button 
                    onClick={() => receiveTransferOrder(transfer.id)}
                    className="h-[36px] px-4 bg-success text-white rounded-md text-[13px] font-medium hover:bg-success/90 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Received
                  </button>
                )}
                {activeTab === "completed" && (
                  <span className="h-[36px] px-4 bg-surface border border-border text-success rounded-md text-[13px] font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Received
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </PageContainer>
  );
}
