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
            <span className="text-[12px] font-medium text-text-secondary">All branches</span>
            <span className="text-text-muted">·</span>
            <span className="text-[12px] font-medium text-text-secondary">Live intelligence</span>
          </div>
        </div>
      </div>

      {/* Right: Search + Notifications */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-md bg-background border border-border text-text-muted text-[13px] w-full max-w-[320px] hover:border-text-muted/30 transition-colors cursor-text text-left"
        >
          <Search className="w-4 h-4 shrink-0 text-text-muted" />
          <span className="truncate flex-1">Search items, suppliers, decisions...</span>
          <kbd className="ml-auto shrink-0 text-[10px] text-text-muted font-medium font-mono border border-border rounded px-1">⌘K</kbd>
        </button>

        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

        {/* Notifications */}
        <NotificationPopover />
      </div>

      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
