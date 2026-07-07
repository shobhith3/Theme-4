"use client";

import { Construction } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-surface border border-border mb-6">
        <Construction className="w-7 h-7 text-text-muted" />
      </div>
      <h2 className="text-xl font-semibold text-text-primary mb-2">{title}</h2>
      <p className="text-sm text-text-secondary max-w-md leading-relaxed">{description}</p>
      <div className="flex items-center gap-2 mt-6 text-xs text-text-muted">
        <div className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
        <span>Coming in the next sprint</span>
      </div>
    </div>
  );
}
