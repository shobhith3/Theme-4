"use client";

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface ConfidenceBadgeProps {
  score: number; // 0 to 100
  className?: string;
}

export function ConfidenceBadge({ score, className }: ConfidenceBadgeProps) {
  let variantClass = "bg-surface-hover text-text-secondary";
  let iconClass = "text-text-muted";

  if (score >= 90) {
    variantClass = "bg-[var(--color-intelligence)]/10 text-[var(--color-intelligence-text)]";
    iconClass = "text-[var(--color-intelligence)]";
  } else if (score >= 70) {
    variantClass = "bg-amber-500/10 text-amber-700";
    iconClass = "text-amber-500";
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-[8px]", variantClass, className)}>
      <Sparkles className={cn("w-3.5 h-3.5", iconClass)} />
      <span className="text-[12px] font-bold tabular-nums tracking-tight leading-none">{score}%</span>
    </div>
  );
}
