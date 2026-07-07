"use client";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-start justify-between gap-4 mb-[32px]", className)}>
      <div className="flex flex-col">
        <h1 className="text-[30px] lg:text-[34px] font-[700] text-text-primary tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-[14px] lg:text-[15px] text-text-secondary mt-2 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
