"use client";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSettings } = useStore();

  const [orgName, setOrgName] = useState(settings.organizationName);
  const [currency, setCurrency] = useState(settings.currency);
  const [leadTime, setLeadTime] = useState(settings.leadTimeBuffer);

  const [showToast, setShowToast] = useState(false);

  // Sync state if it changes externally
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrgName(settings.organizationName);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrency(settings.currency);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLeadTime(settings.leadTimeBuffer);
  }, [settings]);

  const handleSave = () => {
    updateSettings({
      organizationName: orgName,
      currency: currency,
      leadTimeBuffer: Number(leadTime),
    });

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Manage organizational preferences, users, and platform configuration."
      />

      {/* Toast Notification */}
      <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 bg-white border-l-4 border-[var(--color-intelligence)] shadow-lg rounded-md transition-all duration-300 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <CheckCircle2 className="w-5 h-5 text-[var(--color-intelligence)]" />
        <span className="text-[14px] font-medium text-text-primary">Settings saved successfully</span>
      </div>

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
        <div className="flex-1 bg-white border border-border rounded-[16px] p-[32px] shadow-sm h-fit">
          <h2 className="text-[20px] font-bold text-text-primary mb-6">Organization Profile</h2>

          <div className="flex flex-col gap-6 max-w-xl">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-text-primary">Company Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-border rounded-md text-[14px] text-text-primary focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-text-primary">Primary Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-border rounded-md text-[14px] text-text-primary focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-[var(--color-accent)]"
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-text-primary">Global Lead Time Buffer (Days)</label>
              <input
                type="number"
                min="0"
                value={leadTime}
                onChange={(e) => setLeadTime(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-border rounded-md text-[14px] text-text-primary focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>

            <div className="pt-4 mt-2 border-t border-border">
              <button onClick={handleSave} className="px-4 py-2 bg-[var(--color-sidebar-bg)] text-white rounded-md text-[13px] font-medium hover:bg-black transition-colors shadow-sm">
                Save Changes
              </button>
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
