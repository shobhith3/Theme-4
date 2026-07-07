"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Zap } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Lightbulb,
  Truck,
  CheckCircle,
  FileText,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, NAV_SECTIONS } from "@/lib/constants";

const iconMap = {
  LayoutDashboard,
  Package,
  TrendingUp,
  Lightbulb,
  Truck,
  CheckCircle,
  FileText,
  Settings,
} as const;

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();

  if (!open) return null;

  const sections = Object.entries(NAV_SECTIONS) as [keyof typeof NAV_SECTIONS, string][];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-border md:hidden animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/15">
              <Zap className="w-4.5 h-4.5 text-accent" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text-primary tracking-tight">ProcureIQ</span>
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-widest">Intelligence</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="py-4 px-3 overflow-y-auto h-[calc(100vh-64px)]">
          {sections.map(([sectionKey, sectionLabel]) => {
            const sectionItems = NAV_ITEMS.filter((item) => item.section === sectionKey);
            if (sectionItems.length === 0) return null;

            return (
              <div key={sectionKey} className="mb-6">
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                  {sectionLabel}
                </p>
                <ul className="space-y-0.5">
                  {sectionItems.map((item) => {
                    const Icon = iconMap[item.icon];
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                            isActive
                              ? "bg-accent/12 text-accent"
                              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                          )}
                        >
                          <Icon className={cn(
                            "w-4.5 h-4.5 shrink-0 transition-colors",
                            isActive ? "text-accent" : "text-text-muted"
                          )} />
                          <span>{item.label}</span>
                          {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}
