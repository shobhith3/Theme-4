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

const navigation = [
  {
    group: "Overview",
    items: [
      { label: "Today's Decisions", href: "/command-center", icon: LayoutDashboard },
    ]
  },
  {
    group: "Intelligence",
    items: [
      { label: "Inventory", href: "/inventory", icon: Package },
      { label: "Stock Intake", href: "/stock-intake", icon: CheckCircle },
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
      { label: "Purchase Orders", href: "/purchase-orders", icon: FileText },
      { label: "Transfers", href: "/transfers", icon: Truck },
      { label: "Forecasts", href: "/forecasting", icon: TrendingUp },
    ]
  },
  {
    group: "System",
    items: [
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

  return (
    <aside className="h-full w-full flex flex-col bg-[var(--color-sidebar-bg)] transition-all duration-300">
      {/* Brand Header */}
      <div className={cn(
        "flex justify-between items-center h-[72px] px-4 pb-4 pt-3 shrink-0 border-b border-white/5 transition-all duration-300",
        isCollapsed ? "justify-center px-0" : ""
      )}>
        {!isCollapsed && (
          <div className="flex flex-col pl-2">
            <span className="text-[15px] font-semibold text-white tracking-tight leading-tight flex items-center gap-2">
              <BrainCircuit className="w-[18px] h-[18px] text-white" />
              ProcureIQ
            </span>
            <span className="text-[10px] text-[var(--color-sidebar-text-muted)] font-medium uppercase tracking-widest mt-1">
              Decision Intelligence
            </span>
          </div>
        )}
        {isCollapsed && (
          <BrainCircuit className="w-[20px] h-[20px] text-white mx-auto" />
        )}

        {onToggle && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-[var(--color-sidebar-text-muted)] hover:text-white shrink-0"
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
                          ? "bg-white/10 text-white"
                          : "text-[var(--color-sidebar-text)] hover:text-white hover:bg-white/5"
                      )}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <item.icon className={cn(
                        "shrink-0 transition-colors",
                        isCollapsed ? "w-[18px] h-[18px]" : "w-[17px] h-[17px]",
                        isActive ? "text-white" : "text-[var(--color-sidebar-text-muted)] group-hover:text-[var(--color-sidebar-text)]"
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
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Profile Block */}
      <div className="shrink-0 border-t border-white/5 p-3">
        <div className={cn(
          "flex items-center rounded-lg hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/10",
          isCollapsed ? "justify-center p-2" : "gap-3 p-2"
        )}>
          <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
            <span className="text-[12px] font-semibold text-white">SA</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[13px] font-medium text-white truncate leading-tight">Sanjay A.</span>
              <span className="text-[11px] text-[var(--color-sidebar-text-muted)] truncate mt-0.5">Regional Manager</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
