"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  subtitle?: string;
  icon: LucideIcon;
  accentColor: "critical" | "warning" | "success" | "accent";
  delay?: number;
}

const accentStyles = {
  critical: {
    iconBg: "bg-[var(--color-critical-muted)]",
    iconColor: "text-[var(--color-critical)]",
    trendUp: "text-[var(--color-critical)]",
    trendDown: "text-[var(--color-success)]",
  },
  warning: {
    iconBg: "bg-[var(--color-warning-muted)]",
    iconColor: "text-[var(--color-warning)]",
    trendUp: "text-[var(--color-warning)]",
    trendDown: "text-[var(--color-success)]",
  },
  success: {
    iconBg: "bg-[var(--color-success-muted)]",
    iconColor: "text-[var(--color-success)]",
    trendUp: "text-[var(--color-success)]",
    trendDown: "text-[var(--color-critical)]",
  },
  accent: {
    iconBg: "bg-[var(--color-accent-muted)]",
    iconColor: "text-[var(--color-accent)]",
    trendUp: "text-[var(--color-accent)]",
    trendDown: "text-[var(--color-critical)]",
  },
};

export function KpiCard({
  title,
  value,
  trend,
  trendDirection = "neutral",
  subtitle,
  icon: Icon,
  accentColor,
  delay = 0,
}: KpiCardProps) {
  const styles = accentStyles[accentColor];

  return (
    <div
      className="card-base p-5 flex flex-col gap-4 opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg", styles.iconBg)}>
          <Icon className={cn("w-5 h-5", styles.iconColor)} />
        </div>
        {trend && (
          <span className={cn(
            "text-[11px] font-medium px-2 py-0.5 rounded",
            trendDirection === "up" && styles.trendUp,
            trendDirection === "down" && styles.trendDown,
            trendDirection === "neutral" && "text-text-muted",
            "bg-background"
          )}>
            {trend}
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
          {title}
        </p>
        <p className="text-[28px] font-bold tracking-tight text-text-primary tabular-nums leading-none">
          {value}
        </p>
        {subtitle && (
          <p className="text-[13px] text-text-secondary mt-2 leading-tight">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
