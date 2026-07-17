"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { useStore } from "@/store/useStore";
import { getRealData } from "@/app/actions/stock-actions";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isSidebarCollapsed = useStore((s) => s.settings.sidebarCollapsed);
  const updateSettings = useStore((s) => s.updateSettings);
  const hydrateFromServer = useStore((s) => s.hydrateFromServer);

  useEffect(() => {
    async function init() {
      try {
        // Hydrate store from database
        const data = await getRealData();
        hydrateFromServer({
          branches: data.branches as any,
          inventory: data.inventory as any,
          suppliers: data.suppliers as any,
          feedEvents: data.feedEvents as any
        });
      } catch (err) {
        console.error("Failed to sync/hydrate:", err);
      }
    }
    init();
  }, [hydrateFromServer]);

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
            onToggle={() => updateSettings({ sidebarCollapsed: !isSidebarCollapsed })} 
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
