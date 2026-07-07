"use client";

import { Bell, Search, Menu } from "lucide-react";

interface TopbarProps {
  onMobileMenuToggle: () => void;
}

export function Topbar({ onMobileMenuToggle }: TopbarProps) {
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
          <span className="text-[14px] font-semibold text-text-primary">Command Center</span>
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
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-md bg-background border border-border text-text-muted text-[13px] w-full max-w-[320px] hover:border-text-muted/30 transition-colors cursor-text">
          <Search className="w-4 h-4 shrink-0 text-text-muted" />
          <span className="truncate">Search items, suppliers, decisions...</span>
          <kbd className="ml-auto shrink-0 text-[10px] text-text-muted font-medium font-mono">⌘K</kbd>
        </div>

        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

        {/* Notifications */}
        <button className="relative flex items-center justify-center w-9 h-9 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-[6px] h-[6px] rounded-full bg-critical border border-surface" />
        </button>
      </div>
    </header>
  );
}
