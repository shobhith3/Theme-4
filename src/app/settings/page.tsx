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
  const [activeTab, setActiveTab] = useState("organization");
  
  // Auto-approval toggles
  const [autoApproveTransfers, setAutoApproveTransfers] = useState(true);
  const [autoApprovePurchases, setAutoApprovePurchases] = useState(false);

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
            <button 
              onClick={() => setActiveTab("organization")}
              className={`flex items-center w-full px-4 py-2.5 text-[14px] font-medium rounded-[8px] transition-colors ${activeTab === 'organization' ? 'bg-surface font-bold text-text-primary' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'}`}
            >
              Organization
            </button>
            <button 
              onClick={() => setActiveTab("rules")}
              className={`flex items-center w-full px-4 py-2.5 text-[14px] font-medium rounded-[8px] transition-colors ${activeTab === 'rules' ? 'bg-surface font-bold text-text-primary' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'}`}
            >
              Auto-Approval Rules
            </button>
            <button 
              onClick={() => setActiveTab("data-intake")}
              className={`flex items-center w-full px-4 py-2.5 text-[14px] font-medium rounded-[8px] transition-colors ${activeTab === 'data-intake' ? 'bg-surface font-bold text-text-primary' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'}`}
            >
              Data Intake
            </button>
            <button className="flex items-center w-full px-4 py-2.5 text-[14px] font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary rounded-[8px] transition-colors">
              Branches
            </button>
            <button className="flex items-center w-full px-4 py-2.5 text-[14px] font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary rounded-[8px] transition-colors">
              Users & Roles
            </button>
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 bg-white border border-border rounded-[16px] p-[32px] shadow-sm h-fit">
          {activeTab === "organization" && (
            <>
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
            </>
          )}

          {activeTab === "rules" && (
            <>
              <h2 className="text-[20px] font-bold text-text-primary mb-6">Auto-Approval Rules</h2>
              <p className="text-[13px] text-text-secondary mb-8 leading-relaxed max-w-2xl">
                Configure which recommendations the system can execute automatically without manager review. 
                Auto-approvals apply instantly when thresholds are breached.
              </p>

              <div className="flex flex-col gap-6 max-w-2xl">
                <div className="flex items-start justify-between p-4 bg-surface border border-border rounded-xl">
                  <div className="flex flex-col gap-1 pr-6">
                    <span className="text-[14px] font-bold text-text-primary">Auto-Approve Inter-Branch Transfers</span>
                    <span className="text-[13px] text-text-secondary leading-relaxed">
                      Automatically create transfer orders between branches when distance is under 100km and transport cost is cheaper than local purchase.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input type="checkbox" checked={autoApproveTransfers} onChange={(e) => setAutoApproveTransfers(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
                  </label>
                </div>

                <div className="flex items-start justify-between p-4 bg-surface border border-border rounded-xl">
                  <div className="flex flex-col gap-1 pr-6">
                    <span className="text-[14px] font-bold text-text-primary">Auto-Approve Purchase Orders (under ₹10,000)</span>
                    <span className="text-[13px] text-text-secondary leading-relaxed">
                      Automatically send POs to preferred suppliers if the total value is below the threshold and supplier reliability is healthy.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input type="checkbox" checked={autoApprovePurchases} onChange={(e) => setAutoApprovePurchases(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
                  </label>
                </div>
                
                <div className="pt-4 mt-2 border-t border-border">
                  <button onClick={handleSave} className="px-4 py-2 bg-[var(--color-sidebar-bg)] text-white rounded-md text-[13px] font-medium hover:bg-black transition-colors shadow-sm">
                    Save Rules
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "data-intake" && (
            <>
              <h2 className="text-[20px] font-bold text-text-primary mb-6">How ProcureIQ gets data</h2>
              <p className="text-[13px] text-text-secondary mb-8 leading-relaxed max-w-2xl">
                ProcureIQ can update inventory through various integrations and manual inputs.
              </p>

              <div className="flex flex-col gap-6 max-w-2xl">
                <div className="bg-surface border border-border rounded-xl p-5">
                  <h3 className="text-[14px] font-bold text-text-primary mb-3">Supported Sources</h3>
                  <ul className="text-[13px] text-text-secondary space-y-2 list-disc pl-5">
                    <li>POS / billing systems</li>
                    <li>purchase orders</li>
                    <li>supplier invoices</li>
                    <li>Excel / CSV imports</li>
                    <li>barcode or QR scans</li>
                    <li>stock audits</li>
                    <li>branch transfers</li>
                    <li>recipe / BOM mapping</li>
                  </ul>
                </div>
                
                <div className="bg-surface-hover border border-border rounded-xl p-5">
                  <h3 className="text-[13px] font-bold text-text-primary mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-intelligence)]" />
                    Restaurant Example
                  </h3>
                  <p className="text-[13px] text-text-secondary leading-relaxed">
                    If 50 biryanis are sold and each biryani uses 200g chicken, ProcureIQ reduces Chicken Breast by 10 kg automatically.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </PageContainer>
  );
}
