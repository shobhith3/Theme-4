"use client";

export function MetricStrip() {
  return (
    <div className="w-full bg-white border border-border rounded-xl p-5 md:p-0 min-h-[82px] shadow-sm flex items-center">
      <div className="grid grid-cols-2 md:grid-cols-4 w-full divide-y md:divide-y-0 md:divide-x divide-border/50">
        
        {/* Metric 1 */}
        <div className="flex flex-col px-4.5 py-4 md:py-5 first:pl-5 last:pr-5">
          <span className="text-[26px] lg:text-[30px] font-bold text-text-primary tracking-tight leading-none tabular-nums">
            ₹84.2K
          </span>
          <span className="text-[12px] lg:text-[13px] font-medium text-text-secondary mt-1.5">
            Revenue exposed
          </span>
        </div>

        {/* Metric 2 */}
        <div className="flex flex-col px-4.5 py-4 md:py-5 first:pl-5 last:pr-5">
          <span className="text-[26px] lg:text-[30px] font-bold text-text-primary tracking-tight leading-none tabular-nums">
            12
          </span>
          <span className="text-[12px] lg:text-[13px] font-medium text-text-secondary mt-1.5">
            Forecast risks
          </span>
        </div>

        {/* Metric 3 */}
        <div className="flex flex-col px-4.5 py-4 md:py-5 first:pl-5 last:pr-5">
          <span className="text-[26px] lg:text-[30px] font-bold text-text-primary tracking-tight leading-none tabular-nums">
            ₹18.4K
          </span>
          <span className="text-[12px] lg:text-[13px] font-medium text-text-secondary mt-1.5">
            Savings identified
          </span>
        </div>

        {/* Metric 4 */}
        <div className="flex flex-col px-4.5 py-4 md:py-5 first:pl-5 last:pr-5">
          <span className="text-[26px] lg:text-[30px] font-bold text-text-primary tracking-tight leading-none tabular-nums">
            84
          </span>
          <span className="text-[12px] lg:text-[13px] font-medium text-text-secondary mt-1.5">
            Network health
          </span>
        </div>

      </div>
    </div>
  );
}
