"use client";

import { Activity } from "lucide-react";
import { FeedItem } from "./feed-item";
import { mockFeedEvents } from "@/data/mock-feed";

export function IntelligenceFeed() {
  // Sort: critical first, then by timestamp descending
  const sortedEvents = [...mockFeedEvents].sort((a, b) => {
    const priorityOrder = { critical: 0, warning: 1, opportunity: 2, info: 3 };
    const priorityDiff = priorityOrder[a.type] - priorityOrder[b.type];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="card-base p-5 opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Activity className="w-4.5 h-4.5 text-accent" />
          <h3 className="text-sm font-semibold text-text-primary">Procurement Intelligence Feed</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
          <span className="text-[11px] text-text-muted font-medium">Live</span>
        </div>
      </div>

      {/* Feed Items */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {sortedEvents.map((event, i) => (
          <FeedItem key={event.id} event={event} index={i} />
        ))}
      </div>
    </div>
  );
}
