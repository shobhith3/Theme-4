"use client";

import React, { useState, useTransition, useEffect } from "react";
import { X, ArrowLeft, PackagePlus, FilePlus2, FileSpreadsheet, Receipt, ArrowRightLeft, ClipboardCheck, Trash2, CheckCircle2, AlertTriangle, Upload } from "lucide-react";
import { receiveStock, addOpeningStock, recordLoss, adjustStock, transferStock, getRealData } from "@/app/actions/stock-actions";
import { Loader2 } from "lucide-react";

type IntakeMode = "menu" | "receive" | "add" | "transfer" | "audit" | "loss";

export function StockIntakeCenter({ isOpen, onClose, inline = false }: { isOpen: boolean; onClose: () => void; inline?: boolean }) {
  const [mode, setMode] = useState<IntakeMode>("menu");
  const [successMsg, setSuccessMsg] = useState("");
  const [realData, setRealData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      getRealData().then(setRealData).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg("");
      setMode("menu");
      onClose();
      getRealData().then(setRealData).catch(console.error); // refresh data
    }, 2000);
  };

  return (
    <div className={inline ? "relative z-10 flex items-center justify-center p-4" : "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"}>
      <div className={`bg-white shadow-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${inline ? 'rounded-xl h-[80vh]' : 'max-w-2xl max-h-[90vh] rounded-2xl'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            {mode !== "menu" && !successMsg && (
              <button onClick={() => setMode("menu")} className="p-1.5 hover:bg-surface rounded-md text-text-secondary transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-[18px] font-bold text-text-primary">
              {mode === "menu" ? "Stock Intake Center" :
                mode === "receive" ? "Receive Stock" :
                  mode === "add" ? "Add New Item" :
                    mode === "transfer" ? "Transfer Stock" :
                      mode === "audit" ? "Correct Stock Count" : "Record Loss"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-surface rounded-md text-text-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          {successMsg ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 animate-in fade-in">
              <CheckCircle2 className="w-16 h-16 text-success mb-4" />
              <h3 className="text-[xl] font-bold text-text-primary">{successMsg}</h3>
            </div>
          ) : (
            <>
              {mode === "menu" && <MenuGrid onSelect={setMode} />}
              {mode === "receive" && <ReceiveForm onSuccess={() => handleSuccess("Stock added successfully.")} realData={realData} />}
              {mode === "add" && <AddForm onSuccess={() => handleSuccess("New item added.")} realData={realData} />}
              {mode === "transfer" && <TransferForm onSuccess={() => handleSuccess("Stock transferred successfully.")} realData={realData} />}
              {mode === "audit" && <AuditForm onSuccess={() => handleSuccess("Stock count corrected.")} realData={realData} />}
              {mode === "loss" && <LossForm onSuccess={() => handleSuccess("Loss recorded successfully.")} realData={realData} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuGrid({ onSelect }: { onSelect: (m: IntakeMode) => void }) {
  const options = [
    { id: "receive", title: "Receive stock", desc: "Add stock received from a supplier", icon: PackagePlus, color: "text-blue-600", bg: "bg-blue-50" },
    { id: "add", title: "Add new item", desc: "Create a new item and opening stock", icon: FilePlus2, color: "text-purple-600", bg: "bg-purple-50" },
    { id: "transfer", title: "Transfer stock", desc: "Move stock between branches", icon: ArrowRightLeft, color: "text-amber-600", bg: "bg-amber-50" },
    { id: "audit", title: "Correct stock count", desc: "Fix discrepancies from physical count", icon: ClipboardCheck, color: "text-slate-600", bg: "bg-slate-50" },
    { id: "loss", title: "Record loss", desc: "Record expiry, damage, or wastage", icon: Trash2, color: "text-red-600", bg: "bg-red-50" },
  ] as const;

  return (
    <div>
      <p className="text-[14px] text-text-secondary mb-6">How do you want to update stock?</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id as IntakeMode)}
            className="flex items-start gap-4 p-4 text-left border border-border/80 rounded-xl hover:border-[var(--color-accent)] hover:shadow-sm transition-all group bg-white"
          >
            <div className={`p-3 rounded-lg ${opt.bg}`}>
              <opt.icon className={`w-6 h-6 ${opt.color}`} />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-text-primary group-hover:text-[var(--color-accent)] transition-colors">{opt.title}</h3>
              <p className="text-[12px] text-text-secondary mt-1 leading-relaxed">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-FLOW FORMS
// ----------------------------------------------------------------------

function ReceiveForm({ onSuccess, realData }: { onSuccess: () => void, realData: { branches: any[], suppliers: any[], inventory: any[] } }) {
  const { inventory, branches, suppliers } = realData || { branches: [], suppliers: [], inventory: [] };
  const [itemId, setItemId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [qty, setQty] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedItem = inventory.find(i => i.id === itemId);
  const isHighQty = selectedItem && Number(qty) > selectedItem.maxStock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !branchId || !supplierId) return;

    startTransition(async () => {
      try {
        await receiveStock({
          itemId: selectedItem.id,
          branchId,
          supplierId,
          qty: Number(qty)
        });
        onSuccess();
      } catch (err) {
        console.error("Failed to receive stock:", err);
        alert("Failed to receive stock. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-text-primary">Item *</label>
          <select required disabled={isPending} className="p-2.5 bg-surface border border-border rounded-lg text-[13px]" value={itemId} onChange={e => setItemId(e.target.value)}>
            <option value="">Select Item</option>
            {inventory.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-text-primary">Branch *</label>
          <select required disabled={isPending} className="p-2.5 bg-surface border border-border rounded-lg text-[13px]" value={branchId} onChange={e => setBranchId(e.target.value)}>
            <option value="">Select Branch</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-text-primary">Supplier *</label>
          <select required disabled={isPending} className="p-2.5 bg-surface border border-border rounded-lg text-[13px]" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
            <option value="">Select Supplier</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-text-primary">Quantity *</label>
          <div className="flex items-center gap-2">
            <input required disabled={isPending} type="number" min="1" className="p-2.5 flex-1 bg-surface border border-border rounded-lg text-[13px]" value={qty} onChange={e => setQty(e.target.value)} />
            <span className="text-[13px] text-text-muted">{selectedItem?.unit || "-"}</span>
          </div>
        </div>
      </div>

      {isHighQty && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[12px]">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          This quantity may create overstock risk based on expected demand.
        </div>
      )}

      <button disabled={isPending} type="submit" className="mt-4 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-70 text-white rounded-xl font-bold text-[14px] transition-colors flex justify-center items-center gap-2">
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        Save Received Stock
      </button>
    </form>
  );
}

function AddForm({ onSuccess, realData }: { onSuccess: () => void, realData: { branches: any[], suppliers: any[], inventory: any[] } }) {
  const { branches } = realData || { branches: [], suppliers: [], inventory: [] };
  const [name, setName] = useState("");
  const [branchId, setBranchId] = useState("");
  const [qty, setQty] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !branchId) return;
    
    startTransition(async () => {
      try {
        await addOpeningStock({
          name,
          branchId,
          qty: Number(qty)
        });
        onSuccess();
      } catch (err) {
        console.error("Failed to add new item:", err);
        alert("Failed to add new item. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-text-primary">Item Name *</label>
        <input required disabled={isPending} type="text" placeholder="e.g. Curd" className="p-2.5 bg-surface border border-border rounded-lg text-[13px]" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-text-primary">Branch *</label>
          <select required disabled={isPending} className="p-2.5 bg-surface border border-border rounded-lg text-[13px]" value={branchId} onChange={e => setBranchId(e.target.value)}>
            <option value="">Select Branch</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-text-primary">Opening Stock *</label>
          <input required disabled={isPending} type="number" min="0" className="p-2.5 bg-surface border border-border rounded-lg text-[13px]" value={qty} onChange={e => setQty(e.target.value)} />
        </div>
      </div>
      <button disabled={isPending} type="submit" className="mt-4 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-70 text-white rounded-xl font-bold text-[14px] transition-colors flex justify-center items-center gap-2">
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        Add Item
      </button>
    </form>
  );
}



function TransferForm({ onSuccess, realData }: { onSuccess: () => void, realData: { branches: any[], suppliers: any[], inventory: any[] } }) {
  const { inventory, branches } = realData || { branches: [], suppliers: [], inventory: [] };
  const [itemId, setItemId] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [destId, setDestId] = useState("");
  const [qty, setQty] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedItem = inventory.find(i => i.id === itemId && i.branchId === sourceId);
  const isSafetyRisk = selectedItem && (selectedItem.currentStock - Number(qty) < selectedItem.minStock);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !destId || sourceId === destId) return;

    startTransition(async () => {
      try {
        await transferStock({
          itemId: selectedItem.id,
          sourceId,
          destId,
          qty: Number(qty)
        });
        onSuccess();
      } catch (err) {
        console.error("Failed to transfer stock:", err);
        alert("Failed to transfer stock. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-text-primary">Item to Transfer *</label>
        <select required disabled={isPending} className="p-2.5 bg-surface border border-border rounded-lg text-[13px]" value={itemId} onChange={e => setItemId(e.target.value)}>
          <option value="">Select Item</option>
          {Array.from(new Set(inventory.map(i => i.name))).map(name => {
            const id = inventory.find(i => i.name === name)?.id;
            return <option key={id} value={id}>{name}</option>;
          })}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 relative">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-text-primary">Source Branch *</label>
          <select required disabled={isPending} className="p-2.5 bg-surface border border-border rounded-lg text-[13px]" value={sourceId} onChange={e => setSourceId(e.target.value)}>
            <option value="">Select Source</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-text-primary">Destination Branch *</label>
          <select required disabled={isPending} className="p-2.5 bg-surface border border-border rounded-lg text-[13px]" value={destId} onChange={e => setDestId(e.target.value)}>
            <option value="">Select Destination</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="absolute left-1/2 top-[32px] -translate-x-1/2 bg-white border border-border rounded-full p-1 text-text-muted">
          <ArrowRightLeft className="w-3 h-3" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-text-primary">Quantity *</label>
        <input required disabled={isPending} type="number" min="1" className="p-2.5 bg-surface border border-border rounded-lg text-[13px] w-1/2" value={qty} onChange={e => setQty(e.target.value)} />
      </div>

      {isSafetyRisk && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-[12px]">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          Source branch may fall below safe stock after transfer.
        </div>
      )}

      <button disabled={isPending} type="submit" className="mt-4 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-70 text-white rounded-xl font-bold text-[14px] transition-colors flex justify-center items-center gap-2">
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        Execute Transfer
      </button>
    </form>
  );
}

function AuditForm({ onSuccess, realData }: { onSuccess: () => void, realData: { branches: any[], suppliers: any[], inventory: any[] } }) {
  const { inventory, branches } = realData || { branches: [], suppliers: [], inventory: [] };
  const [itemId, setItemId] = useState("");
  const [qty, setQty] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedItem = inventory.find(i => i.id === itemId);
  const diff = selectedItem && qty ? Number(qty) - selectedItem.currentStock : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    startTransition(async () => {
      try {
        await adjustStock({
          itemId: selectedItem.id,
          branchId: selectedItem.branchId,
          newQty: Number(qty)
        });
        onSuccess();
      } catch (err) {
        console.error("Failed to adjust stock:", err);
        alert("Failed to adjust stock. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-text-primary">Item to Correct *</label>
        <select required disabled={isPending} className="p-2.5 bg-surface border border-border rounded-lg text-[13px]" value={itemId} onChange={e => setItemId(e.target.value)}>
          <option value="">Select Item</option>
          {inventory.map(i => <option key={i.id} value={i.id}>{i.name} ({branches.find(b => b.id === i.branchId)?.name})</option>)}
        </select>
      </div>

      {selectedItem && (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">System Stock</label>
            <div className="p-2.5 bg-surface border border-border rounded-lg text-[13px] font-medium text-text-secondary cursor-not-allowed">
              {selectedItem.currentStock} {selectedItem.unit}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-primary">Actual Count *</label>
            <input required disabled={isPending} type="number" min="0" className="p-2.5 bg-surface border border-border rounded-lg text-[13px]" value={qty} onChange={e => setQty(e.target.value)} />
          </div>
        </div>
      )}

      {selectedItem && qty && diff !== 0 && (
        <div className={`text-[13px] font-medium ${diff > 0 ? "text-success" : "text-critical"}`}>
          Adjustment: {diff > 0 ? "+" : ""}{diff} {selectedItem.unit}
        </div>
      )}

      <button disabled={!qty || diff === 0 || isPending} type="submit" className="mt-4 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 text-white rounded-xl font-bold text-[14px] transition-colors flex justify-center items-center gap-2">
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        Correct Stock
      </button>
    </form>
  );
}

function LossForm({ onSuccess, realData }: { onSuccess: () => void, realData: { branches: any[], suppliers: any[], inventory: any[] } }) {
  const { inventory, branches } = realData || { branches: [], suppliers: [], inventory: [] };
  const [itemId, setItemId] = useState("");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("wastage");
  const [isPending, startTransition] = useTransition();

  const selectedItem = inventory.find(i => i.id === itemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    startTransition(async () => {
      try {
        await recordLoss({
          itemId: selectedItem.id,
          branchId: selectedItem.branchId,
          qty: Number(qty),
          type: reason
        });
        onSuccess();
      } catch (err) {
        console.error("Failed to record loss:", err);
        alert("Failed to record loss. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-text-primary">Item *</label>
        <select required disabled={isPending} className="p-2.5 bg-surface border border-border rounded-lg text-[13px]" value={itemId} onChange={e => setItemId(e.target.value)}>
          <option value="">Select Item</option>
          {inventory.map(i => <option key={i.id} value={i.id}>{i.name} ({branches.find(b => b.id === i.branchId)?.name})</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-text-primary">Quantity Lost *</label>
          <input required disabled={isPending} type="number" min="1" className="p-2.5 bg-surface border border-border rounded-lg text-[13px]" value={qty} onChange={e => setQty(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-text-primary">Type of Loss *</label>
          <select required disabled={isPending} className="p-2.5 bg-surface border border-border rounded-lg text-[13px]" value={reason} onChange={e => setReason(e.target.value)}>
            <option value="wastage">Wastage</option>
            <option value="damage">Damage</option>
            <option value="expiry">Expiry</option>
          </select>
        </div>
      </div>

      <button disabled={isPending} type="submit" className="mt-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-70 text-white rounded-xl font-bold text-[14px] transition-colors flex justify-center items-center gap-2">
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        Record Loss
      </button>
    </form>
  );
}
