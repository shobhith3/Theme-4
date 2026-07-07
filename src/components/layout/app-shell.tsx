"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Nav */}
      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <div 
        className="min-h-screen w-full bg-background text-text-primary xl:grid transition-all duration-300"
        style={{
          gridTemplateColumns: isSidebarCollapsed ? '72px minmax(0,1fr)' : '236px minmax(0,1fr)'
        }}
      >
        
        {/* Desktop Sidebar */}
        <div className="hidden xl:block h-screen sticky top-0 border-r border-white/5 z-40 bg-[var(--color-sidebar-bg)] overflow-hidden transition-all duration-300">
          <Sidebar 
            isCollapsed={isSidebarCollapsed} 
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col min-h-screen min-w-0 w-full relative">
          <Topbar onMobileMenuToggle={() => setMobileNavOpen(true)} />
          <main className="flex-1 w-full relative min-w-0">
            <div className="w-full max-w-[1540px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
