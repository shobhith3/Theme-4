"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Lightbulb,
  Truck,
  CheckCircle,
  FileText,
  Settings,
  BrainCircuit,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AiAssistantDrawer } from "./ai-assistant-drawer";

const navigation = [
  {
    group: "Overview",
    items: [
      { label: "Today's Decisions", href: "/command-center", icon: LayoutDashboard, badge: 7 },
    ]
  },
  {
    group: "Intelligence",
    items: [
      { label: "Inventory", href: "/inventory", icon: Package, badge: 12 },
      { label: "Stock Intake", href: "/stock-intake", icon: CheckCircle, badge: 3 },
    ]
  },
  {
    group: "Network",
    items: [
      { label: "Suppliers", href: "/suppliers", icon: Truck },
    ]
  },
  {
    group: "Execution",
    items: [
      { label: "Purchase Orders", href: "/purchase-orders", icon: FileText, badge: 5 },
      { label: "Transfers", href: "/transfers", icon: Truck, badge: 3 },
      { label: "Forecasts", href: "/forecasting", icon: TrendingUp },
    ]
  },
  {
    group: "System",
    items: [
      { label: "Reports", href: "/reports", icon: FileText },
      { label: "Settings / Rules", href: "/settings", icon: Settings },
    ]
  }
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <aside className="h-full w-full flex flex-col bg-[var(--color-sidebar-bg)] border-r border-border transition-all duration-300">
      {/* Brand Header */}
      <div className={cn(
        "flex justify-between items-center h-[72px] px-4 pb-4 pt-3 shrink-0 border-b border-border transition-all duration-300",
        isCollapsed ? "justify-center px-0" : ""
      )}>
        {!isCollapsed && (
          <div className="flex flex-col pl-2">
            <span className="text-[15px] font-semibold text-text-primary tracking-tight leading-tight flex items-center gap-2">
              <BrainCircuit className="w-[18px] h-[18px] text-[var(--color-intelligence)]" />
              ProcureIQ
            </span>
            <span className="text-[10px] text-[var(--color-sidebar-text-muted)] font-medium uppercase tracking-widest mt-1">
              Decision Intelligence
            </span>
          </div>
        )}
        {isCollapsed && (
          <BrainCircuit className="w-[20px] h-[20px] text-[var(--color-intelligence)] mx-auto" />
        )}

        {onToggle && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md hover:bg-surface-hover transition-colors text-[var(--color-sidebar-text-muted)] hover:text-text-primary shrink-0"
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-[18px] h-[18px]" />
            ) : (
              <PanelLeftClose className="w-[18px] h-[18px]" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hidden">
        {navigation.map((section, idx) => (
          <div key={section.group} className={cn(idx !== 0 && "mt-5")}>
            {!isCollapsed && (
              <p className="px-2 mb-1.5 text-[11px] font-[650] uppercase tracking-[0.08em] text-[var(--color-sidebar-text-muted)] w-full">
                {section.group}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "relative flex items-center rounded-lg h-10 text-[14px] font-medium transition-colors group",
                        isCollapsed ? "justify-center px-0 w-full" : "gap-2.5 px-2 w-full",
                        isActive
                          ? "bg-[var(--color-sidebar-active-bg)] text-[var(--color-sidebar-active-text)]"
                          : "text-[var(--color-sidebar-text)] hover:text-text-primary hover:bg-surface-hover"
                      )}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <item.icon className={cn(
                        "shrink-0 transition-colors",
                        isCollapsed ? "w-[18px] h-[18px]" : "w-[17px] h-[17px]",
                        isActive ? "text-[var(--color-sidebar-active-text)]" : "text-[var(--color-sidebar-text-muted)] group-hover:text-[var(--color-sidebar-text)]"
                      )} />
                      {!isCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                      {isActive && !isCollapsed && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[var(--color-intelligence)] rounded-r-full" />
                      )}
                      {isActive && isCollapsed && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[16px] bg-[var(--color-intelligence)] rounded-r-md" />
                      )}
                      {(item as any).badge && !isCollapsed && (
                        <span className="ml-auto flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[var(--color-intelligence)] text-[11px] font-bold text-white">
                          {(item as any).badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Cards */}
      {!isCollapsed && (
        <div className="shrink-0 border-t border-border p-3 flex flex-col gap-3">
          {/* AI Procurement Assistant Card */}
          <div className="bg-surface-hover border border-border rounded-lg p-3">
            <h4 className="text-[12px] font-bold text-text-primary flex items-center gap-1.5 mb-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-warning" /> AI Assistant
            </h4>
            <p className="text-[11px] text-[var(--color-sidebar-text-muted)] mb-3 leading-relaxed">
              Ask anything about inventory, suppliers, or decisions.
            </p>
            <button 
              onClick={() => setIsAiOpen(true)}
              className="w-full h-[32px] bg-white border border-border text-text-primary font-semibold rounded-md text-[11px] hover:bg-surface transition-colors shadow-sm"
            >
              Ask AI Assistant
            </button>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-surface border border-border rounded-lg p-3">
            <h4 className="text-[11px] font-bold text-[var(--color-sidebar-text-muted)] uppercase tracking-wider mb-2">
              Quick Actions
            </h4>
            <div className="flex flex-col gap-1">
              <Link href="/inventory" className="text-[12px] text-text-secondary hover:text-[var(--color-intelligence)] transition-colors py-1">Add New Item</Link>
              <Link href="/stock-intake" className="text-[12px] text-text-secondary hover:text-[var(--color-intelligence)] transition-colors py-1">Receive Stock</Link>
              <Link href="/purchase-orders" className="text-[12px] text-text-secondary hover:text-[var(--color-intelligence)] transition-colors py-1">Create Purchase Order</Link>
              <Link href="/transfers" className="text-[12px] text-text-secondary hover:text-[var(--color-intelligence)] transition-colors py-1">Create Transfer</Link>
            </div>
          </div>
        </div>
      )}

      <AiAssistantDrawer isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </aside>
  );
}
