"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { ConfidenceBadge } from "@/components/common/confidence-badge";
import { useStore } from "@/store/useStore";
import { useMemo } from "react";

export default function ApprovalsPage() {
  const recommendations = useStore(s => s.recommendations);
  const approveRecommendation = useStore(s => s.approveRecommendation);
  const rejectRecommendation = useStore(s => s.rejectRecommendation);

  const pendingApprovals = useMemo(() => {
    return recommendations.filter(r => r.status === "pending").sort((a, b) => {
      if (a.urgency === 'critical' && b.urgency !== 'critical') return -1;
      if (b.urgency === 'critical' && a.urgency !== 'critical') return 1;
      return 0;
    });
  }, [recommendations]);

  const stats = useMemo(() => {
    let criticalCount = 0;
    let dueToday = 0; // rough proxy: timeToBreach < 24h
    let totalSpend = 0;
    let revenueProtected = 0;

    pendingApprovals.forEach(r => {
      if (r.urgency === 'critical') criticalCount++;
      if (r.timeToBreach && r.timeToBreach.includes("hours")) {
        const hrs = parseInt(r.timeToBreach);
        if (hrs < 24) dueToday++;
      }
      totalSpend += (r.estimatedCost || 0);
      revenueProtected += (r.estimatedSavings || 0);
    });

    return { criticalCount, dueToday, totalSpend, revenueProtected };
  }, [pendingApprovals]);

  const handleApprove = (id: string) => {
    approveRecommendation(id);
  };

  const handleReject = (id: string) => {
    rejectRecommendation(id);
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Approval Center" 
        description="Review procurement and inventory actions requiring authorization." 
      />

      {/* Top Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="flex flex-col bg-white border border-border rounded-xl p-4">
          <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-1">Critical</span>
          <span className="text-[24px] font-bold text-critical tabular-nums">{stats.criticalCount}</span>
        </div>
        <div className="flex flex-col bg-white border border-border rounded-xl p-4">
          <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-1">Due Today</span>
          <span className="text-[24px] font-bold text-amber-600 tabular-nums">{stats.dueToday}</span>
        </div>
        <div className="flex flex-col bg-white border border-border rounded-xl p-4">
          <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-1">Total Proposed Spend</span>
          <span className="text-[24px] font-bold text-text-primary tabular-nums">₹{stats.totalSpend.toLocaleString()}</span>
        </div>
        <div className="flex flex-col bg-white border border-border rounded-xl p-4">
          <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-1">Revenue Protected</span>
          <span className="text-[24px] font-bold text-[var(--color-intelligence)] tabular-nums">₹{stats.revenueProtected.toLocaleString()}</span>
        </div>
      </div>

      {/* Approval List */}
      <div className="w-full overflow-x-auto rounded-[12px] border border-border bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface/50">
              <th className="px-4 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider">Decision</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider">Branch</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider">Action Type</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider text-right">Financial Impact</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider text-center">Confidence</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider">Deadline</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pendingApprovals.map((decision) => (
              <tr key={decision.id} className="hover:bg-surface-hover transition-colors">
                <td className="px-4 py-3.5 text-[13px] font-bold text-text-primary">{decision.itemName}</td>
                <td className="px-4 py-3.5 text-[13px] font-medium text-text-secondary">{decision.branchName}</td>
                <td className="px-4 py-3.5 text-[13px] font-medium text-text-primary capitalize">{decision.type}</td>
                <td className="px-4 py-3.5 text-[13px] font-bold text-text-primary tabular-nums text-right">
                  {decision.estimatedSavings ? `+₹${decision.estimatedSavings.toLocaleString()}` : `-₹${decision.estimatedCost?.toLocaleString()}`}
                </td>
                <td className="px-4 py-3.5 flex justify-center"><ConfidenceBadge score={decision.confidenceScore} /></td>
                <td className="px-4 py-3.5 text-[13px] font-medium text-text-secondary">{decision.timeToBreach || 'None'}</td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleReject(decision.id)} className="px-3 py-1.5 bg-white border border-border rounded text-[12px] font-medium text-text-primary hover:bg-red-50 hover:text-critical transition-colors shadow-sm">Reject</button>
                    <button onClick={() => handleApprove(decision.id)} className="px-3 py-1.5 bg-[var(--color-sidebar-bg)] text-white border border-transparent rounded text-[12px] font-medium hover:bg-black transition-colors shadow-sm">Approve</button>
                  </div>
                </td>
              </tr>
            ))}
            {pendingApprovals.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-[13px] text-text-muted">
                  No pending approvals.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
