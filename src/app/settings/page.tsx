"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";

export default function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader 
        title="Settings" 
        description="Manage organizational preferences, users, and platform configuration." 
      />

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Settings Navigation */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-1">
            <button className="flex items-center w-full px-4 py-2.5 bg-surface text-[14px] font-bold text-text-primary rounded-[8px]">
              Organization
            </button>
            <button className="flex items-center w-full px-4 py-2.5 text-[14px] font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary rounded-[8px] transition-colors">
              Branches
            </button>
            <button className="flex items-center w-full px-4 py-2.5 text-[14px] font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary rounded-[8px] transition-colors">
              Users & Roles
            </button>
            <button className="flex items-center w-full px-4 py-2.5 text-[14px] font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary rounded-[8px] transition-colors">
              Inventory Rules
            </button>
            <button className="flex items-center w-full px-4 py-2.5 text-[14px] font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary rounded-[8px] transition-colors">
              Forecasting
            </button>
            <button className="flex items-center w-full px-4 py-2.5 text-[14px] font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary rounded-[8px] transition-colors">
              Notifications
            </button>
            <button className="flex items-center w-full px-4 py-2.5 text-[14px] font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary rounded-[8px] transition-colors">
              Integrations
            </button>
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 bg-white border border-border rounded-[16px] p-[32px] shadow-sm">
          <h2 className="text-[20px] font-bold text-text-primary mb-6">Organization Profile</h2>
          
          <div className="flex flex-col gap-6 max-w-xl">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-text-primary">Company Name</label>
              <input 
                type="text" 
                defaultValue="Calm Industrial Intelligence" 
                className="w-full px-3 py-2 bg-white border border-border rounded-md text-[14px] text-text-primary focus:outline-none focus:border-border-strong"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-text-primary">Primary Currency</label>
              <select className="w-full px-3 py-2 bg-white border border-border rounded-md text-[14px] text-text-primary focus:outline-none focus:border-border-strong">
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-text-primary">Global Lead Time Buffer (Days)</label>
              <input 
                type="number" 
                defaultValue="2" 
                className="w-full px-3 py-2 bg-white border border-border rounded-md text-[14px] text-text-primary focus:outline-none focus:border-border-strong"
              />
            </div>

            <div className="pt-4 mt-2 border-t border-border">
              <button className="px-4 py-2 bg-[var(--color-sidebar-bg)] text-white rounded-md text-[13px] font-medium hover:bg-black transition-colors shadow-sm">
                Save Changes
              </button>
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
