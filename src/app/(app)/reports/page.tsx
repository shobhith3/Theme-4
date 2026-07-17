"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { TrendingDown, PackageX, Truck, RefreshCcw, TrendingUp, Download, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function ReportsPage() {
  const reports = [
    { title: "Revenue at Risk Trend", desc: "Historical tracking of potential lost sales due to stockouts.", icon: <TrendingDown className="w-5 h-5 text-critical" /> },
    { title: "Stockout Avoided", desc: "Estimated sales protected by timely procurement decisions.", icon: <PackageX className="w-5 h-5 text-success" /> },
    { title: "Waste Avoided", desc: "Savings from preventing overstock and spoilage.", icon: <TrendingUp className="w-5 h-5 text-success" /> },
    { title: "Supplier Performance", desc: "Aggregate reliability, lead time, and defect metrics.", icon: <Truck className="w-5 h-5 text-[var(--color-intelligence)]" /> },
    { title: "Auto-Approval Summary", desc: "Decisions executed automatically by rule configurations.", icon: <RefreshCcw className="w-5 h-5 text-[var(--color-intelligence)]" /> },
    { title: "Forecast Accuracy", desc: "Comparison of AI predicted demand vs actual consumption.", icon: <TrendingUp className="w-5 h-5 text-warning" /> }
  ];

  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [showToast, setShowToast] = useState(false);

  const handleExport = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8">
        <PageHeader
          title="Reports & Analytics"
          description="View historical performance, risk mitigation, and operational metrics."
        />
        <div className="flex items-center gap-3 mt-4 md:mt-0 relative">
          {showToast && (
            <div className="absolute top-12 right-0 bg-success text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-[13px] font-bold animate-in fade-in slide-in-from-top-2 whitespace-nowrap z-50">
              <CheckCircle2 className="w-4 h-4" /> Export Started successfully
            </div>
          )}
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-md text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors shadow-sm cursor-pointer outline-none"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Year to Date</option>
          </select>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--color-accent)] border border-[var(--color-accent)] rounded-md text-[13px] font-medium text-white hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col group cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-surface-hover flex items-center justify-center mb-4 border border-border group-hover:border-text-muted/30 transition-colors">
              {report.icon}
            </div>
            <h3 className="text-[15px] font-bold text-text-primary mb-2">{report.title}</h3>
            <p className="text-[13px] text-text-secondary mb-5 flex-1 leading-relaxed">
              {report.desc}
            </p>
            <div className="flex items-center text-[13px] font-medium text-[var(--color-intelligence)] group-hover:underline">
              View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
