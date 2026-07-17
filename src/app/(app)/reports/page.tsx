import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import ReportsContent from "@/components/reports/reports-content";
import { getIntelligenceMetrics } from "@/app/actions/intelligence-actions";
import { Download, CheckCircle2 } from "lucide-react";

export default async function ReportsPage() {
  const metrics = await getIntelligenceMetrics();

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8">
        <PageHeader
          title="Reports & Analytics"
          description="View historical performance, risk mitigation, and operational metrics."
        />
        <div className="flex items-center gap-3 mt-4 md:mt-0 relative">
          <select 
            className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-md text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors shadow-sm cursor-pointer outline-none"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Year to Date</option>
          </select>
        </div>
      </div>
      <ReportsContent metrics={metrics} />
    </PageContainer>
  );
}
