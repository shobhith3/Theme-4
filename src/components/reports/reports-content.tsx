"use client";

import { TrendingDown, PackageX, Truck, RefreshCcw, TrendingUp, ArrowRight } from "lucide-react";

export default function ReportsContent({ metrics }: { metrics: any }) {
  const reports = [
    { title: "Revenue at Risk Trend", desc: "Historical tracking of potential lost sales due to stockouts.", icon: <TrendingDown className="w-5 h-5 text-critical" />, value: "₹0", statLabel: "Current Risk" },
    { title: "Stockouts Avoided", desc: "Estimated sales protected by timely procurement decisions.", icon: <PackageX className="w-5 h-5 text-success" />, value: metrics.stockoutsAvoided, statLabel: "Instances" },
    { title: "Waste Avoided", desc: "Savings from preventing overstock and spoilage.", icon: <TrendingUp className="w-5 h-5 text-success" />, value: metrics.wasteAvoided, statLabel: "Instances" },
    { title: "Revenue Protected", desc: "Total revenue protected by AI decisions.", icon: <TrendingUp className="w-5 h-5 text-success" />, value: `₹${metrics.totalRevenueProtected.toLocaleString()}`, statLabel: "Total" },
    { title: "AI Decisions", desc: "Decisions executed by the intelligence engine.", icon: <RefreshCcw className="w-5 h-5 text-[var(--color-intelligence)]" />, value: metrics.totalDecisions, statLabel: "Total" },
    { title: "Forecast Accuracy", desc: "Comparison of AI predicted demand vs actual consumption.", icon: <TrendingUp className="w-5 h-5 text-warning" />, value: `${metrics.avgAccuracy.toFixed(1)}%`, statLabel: "Average" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reports.map((report, i) => (
        <div key={i} className="bg-surface border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col group cursor-pointer relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-surface-hover flex items-center justify-center border border-border group-hover:border-text-muted/30 transition-colors">
              {report.icon}
            </div>
            <div className="text-right">
              <div className="text-[20px] font-black text-text-primary tabular-nums leading-none mb-1">
                {report.value}
              </div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                {report.statLabel}
              </div>
            </div>
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
  );
}
