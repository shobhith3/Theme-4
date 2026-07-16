"use client";

import { Search, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { NotificationPopover } from "./notification-popover";
import { SearchDialog } from "./search-dialog";

interface TopbarProps {
  onMobileMenuToggle: () => void;
}

export function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getPageTitle = () => {
    if (pathname?.includes("inventory")) return "Inventory Network";
    if (pathname?.includes("forecast")) return "Forecast Studio";
    if (pathname?.includes("recommendation") || pathname?.includes("decision")) return "Decision Center";
    if (pathname?.includes("supplier")) return "Supplier Network";
    if (pathname?.includes("approval")) return "Approval Center";
    if (pathname?.includes("purchase-order") || pathname?.includes("order")) return "Purchase Orders";
    if (pathname?.includes("setting")) return "Settings";
    return "Command Center";
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-[68px] px-6 lg:px-[32px] bg-surface border-b border-border">
      {/* Left: Mobile menu + Page context */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="xl:hidden flex items-center justify-center w-10 h-10 -ml-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col justify-center">
          <span className="text-[14px] font-semibold text-text-primary">{getPageTitle()}</span>
          <div className="flex items-center gap-1.5 mt-[2px]">
            <select className="text-[12px] font-medium text-text-secondary bg-transparent border-none focus:ring-0 cursor-pointer hover:text-text-primary transition-colors appearance-none pr-3">
              <option>Hyderabad Central</option>
              <option>Warangal Hub</option>
              <option>Siddipet Main</option>
            </select>
            <span className="text-text-muted">·</span>
            <span className="text-[12px] font-medium text-text-secondary">Live intelligence</span>
          </div>
        </div>
      </div>

      {/* Right: Search + Notifications + Profile */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-md bg-background border border-border text-text-muted text-[13px] w-full max-w-[320px] hover:border-text-muted/30 transition-colors cursor-text text-left"
        >
          <Search className="w-4 h-4 shrink-0 text-text-muted" />
          <span className="truncate flex-1">Search items, suppliers, decisions...</span>
          <kbd className="ml-auto shrink-0 text-[10px] text-text-muted font-medium font-mono border border-border rounded px-1">Ctrl + K</kbd>
        </button>

        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

        <button className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-full hover:bg-surface-hover">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
        </button>

        {/* Notifications */}
        <NotificationPopover />

        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer p-1.5 rounded-lg hover:bg-surface-hover transition-colors">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-[13px] font-semibold text-text-primary leading-tight">Rohit</span>
            <span className="text-[11px] text-text-secondary">Manager</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[var(--color-intelligence)] flex items-center justify-center text-white font-bold text-[13px]">
            R
          </div>
        </div>
      </div>

      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
