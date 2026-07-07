"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { ConfidenceBadge } from "@/components/common/confidence-badge";
import { mockDecisions } from "@/lib/mock-data";

export default function ApprovalsPage() {
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
          <span className="text-[24px] font-bold text-critical tabular-nums">3</span>
        </div>
        <div className="flex flex-col bg-white border border-border rounded-xl p-4">
          <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-1">Due Today</span>
          <span className="text-[24px] font-bold text-amber-600 tabular-nums">7</span>
        </div>
        <div className="flex flex-col bg-white border border-border rounded-xl p-4">
          <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-1">Total Proposed Spend</span>
          <span className="text-[24px] font-bold text-text-primary tabular-nums">₹42,600</span>
        </div>
        <div className="flex flex-col bg-white border border-border rounded-xl p-4">
          <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-1">Revenue Protected</span>
          <span className="text-[24px] font-bold text-[var(--color-intelligence)] tabular-nums">₹68,200</span>
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
            {mockDecisions.map((decision, i) => (
              <tr key={i} className="hover:bg-surface-hover transition-colors">
                <td className="px-4 py-3.5 text-[13px] font-bold text-text-primary">{decision.item}</td>
                <td className="px-4 py-3.5 text-[13px] font-medium text-text-secondary">{decision.branch}</td>
                <td className="px-4 py-3.5 text-[13px] font-medium text-text-primary">{decision.strategyType}</td>
                <td className="px-4 py-3.5 text-[13px] font-bold text-text-primary tabular-nums text-right">₹{decision.netProtection.toLocaleString()}</td>
                <td className="px-4 py-3.5 flex justify-center"><ConfidenceBadge score={decision.confidence} /></td>
                <td className="px-4 py-3.5 text-[13px] font-medium text-text-secondary">{decision.timeToBreach}</td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="px-3 py-1.5 bg-white border border-border rounded text-[12px] font-medium text-text-primary hover:bg-surface-hover shadow-sm">Reject</button>
                    <button className="px-3 py-1.5 bg-[var(--color-sidebar-bg)] text-white border border-transparent rounded text-[12px] font-medium hover:bg-black shadow-sm">Approve</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
