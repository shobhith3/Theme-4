"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Determine variant based on text content
  const s = status.toLowerCase();
  
  let variantClass = "bg-surface-hover text-text-secondary"; // Default

  if (s.includes("critical") || s.includes("stockout") || s.includes("rejected")) {
    variantClass = "bg-critical/10 text-critical border border-critical/20";
  } else if (s.includes("high") || s.includes("overstock") || s.includes("at-risk")) {
    variantClass = "bg-amber-500/10 text-amber-700 border border-amber-500/20";
  } else if (s.includes("approved") || s.includes("completed") || s.includes("received")) {
    variantClass = "bg-[var(--color-intelligence)]/10 text-[var(--color-intelligence-text)] border border-[var(--color-intelligence)]/20";
  } else if (s.includes("monitored") || s.includes("in transit") || s.includes("sent")) {
    variantClass = "bg-blue-500/10 text-blue-700 border border-blue-500/20";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] font-semibold tracking-wider uppercase whitespace-nowrap",
        variantClass,
        className
      )}
    >
      {status}
    </span>
  );
}
