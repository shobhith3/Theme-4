"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, TrendingUp, Info, ArrowRight, Clock } from "lucide-react";
import type { FeedEvent } from "@/types";

interface FeedItemProps {
  event: FeedEvent;
  index: number;
}

const typeConfig = {
  critical: {
    icon: AlertCircle,
    label: "CRITICAL",
    badgeClass: "badge-critical",
    borderClass: "border-l-critical",
    dotClass: "bg-critical",
    iconColor: "text-critical",
  },
  warning: {
    icon: AlertTriangle,
    label: "WARNING",
    badgeClass: "badge-warning",
    borderClass: "border-l-warning",
    dotClass: "bg-warning",
    iconColor: "text-warning",
  },
  opportunity: {
    icon: TrendingUp,
    label: "OPPORTUNITY",
    badgeClass: "badge-success",
    borderClass: "border-l-success",
    dotClass: "bg-success",
    iconColor: "text-success",
  },
  info: {
    icon: Info,
    label: "INFO",
    badgeClass: "badge-info",
    borderClass: "border-l-info",
    dotClass: "bg-info",
    iconColor: "text-info",
  },
};

export function FeedItem({ event, index }: FeedItemProps) {
  const config = typeConfig[event.type];
  const Icon = config.icon;

  const timestamp = new Date(event.timestamp);
  const now = new Date("2026-07-07T15:00:00Z");
  const hoursAgo = Math.round((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
  const timeLabel = hoursAgo < 1 ? "just now" : `${hoursAgo}h ago`;

  return (
    <div
      className={cn(
        "card-base border-l-[3px] p-4 opacity-0 animate-fade-in group",
        config.borderClass
      )}
      style={{ animationDelay: `${index * 80 + 200}ms` }}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dotClass, event.type === "critical" && "pulse-dot")} />
          <span className={cn("text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded", config.badgeClass)}>
            {config.label}
          </span>
          <span className="text-sm font-semibold text-text-primary">{event.title}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-text-muted shrink-0">
          <Clock className="w-3 h-3" />
          {timeLabel}
        </div>
      </div>

      {/* Item + Branch */}
      <div className="flex items-center gap-2 mb-2 ml-4">
        <span className="text-sm font-medium text-text-primary">{event.itemName}</span>
        <span className="text-text-muted">·</span>
        <span className="text-xs text-text-secondary">{event.branchName}</span>
      </div>

      {/* Description */}
      <p className="text-xs text-text-secondary leading-relaxed mb-3 ml-4">
        {event.description}
      </p>

      {/* Metric + Action */}
      <div className="flex items-center justify-between ml-4">
        {event.metric && event.metricValue && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-text-muted">{event.metric}:</span>
            <span className={cn("text-xs font-semibold", config.iconColor)}>{event.metricValue}</span>
          </div>
        )}
        {event.estimatedImpact && (
          <span className="text-[11px] text-text-muted italic hidden sm:inline">{event.estimatedImpact}</span>
        )}
        {event.actionLabel && (
          <button className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover transition-colors ml-auto">
            {event.actionLabel}
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>
    </div>
  );
}
