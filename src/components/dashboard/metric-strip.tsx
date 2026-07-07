"use client";

import { useStore } from "@/store/useStore";
import { useMemo } from "react";

export function MetricStrip({ branchId }: { branchId?: string }) {
  const recommendations = useStore((s) => s.recommendations);
  
  const metrics = useMemo(() => {
    let revenueExposed = 0;
    let forecastRisks = 0;
    let savingsIdentified = 0;

    const relevantRecs = branchId 
      ? recommendations.filter(r => r.branchId === branchId)
      : recommendations;

    relevantRecs.forEach(r => {
      if (r.status === "pending") {
        revenueExposed += (r.estimatedCost || 0) + (r.estimatedSavings || 0); // Simplified proxy for exposure
        forecastRisks += 1;
        savingsIdentified += (r.estimatedSavings || 0);
      }
    });

    return {
      revenueExposed,
      forecastRisks,
      savingsIdentified,
      networkHealth: branchId ? 88 : 84 // Static mock for health score
    };
  }, [recommendations, branchId]);

  return (
    <div className="w-full bg-white border border-border rounded-xl p-5 md:p-0 min-h-[82px] shadow-sm flex items-center">
      <div className="grid grid-cols-2 md:grid-cols-4 w-full divide-y md:divide-y-0 md:divide-x divide-border/50">
        
        {/* Metric 1 */}
        <div className="flex flex-col px-4.5 py-4 md:py-5 first:pl-5 last:pr-5">
          <span className="text-[26px] lg:text-[30px] font-bold text-text-primary tracking-tight leading-none tabular-nums">
            ₹{(metrics.revenueExposed / 1000).toFixed(1)}K
          </span>
          <span className="text-[12px] lg:text-[13px] font-medium text-text-secondary mt-1.5">
            Revenue exposed
          </span>
        </div>

        {/* Metric 2 */}
        <div className="flex flex-col px-4.5 py-4 md:py-5 first:pl-5 last:pr-5">
          <span className="text-[26px] lg:text-[30px] font-bold text-text-primary tracking-tight leading-none tabular-nums">
            {metrics.forecastRisks}
          </span>
          <span className="text-[12px] lg:text-[13px] font-medium text-text-secondary mt-1.5">
            Forecast risks
          </span>
        </div>

        {/* Metric 3 */}
        <div className="flex flex-col px-4.5 py-4 md:py-5 first:pl-5 last:pr-5">
          <span className="text-[26px] lg:text-[30px] font-bold text-text-primary tracking-tight leading-none tabular-nums">
            ₹{(metrics.savingsIdentified / 1000).toFixed(1)}K
          </span>
          <span className="text-[12px] lg:text-[13px] font-medium text-text-secondary mt-1.5">
            Savings identified
          </span>
        </div>

        {/* Metric 4 */}
        <div className="flex flex-col px-4.5 py-4 md:py-5 first:pl-5 last:pr-5">
          <span className="text-[26px] lg:text-[30px] font-bold text-text-primary tracking-tight leading-none tabular-nums">
            {metrics.networkHealth}
          </span>
          <span className="text-[12px] lg:text-[13px] font-medium text-text-secondary mt-1.5">
            Network health
          </span>
        </div>

      </div>
    </div>
  );
}
