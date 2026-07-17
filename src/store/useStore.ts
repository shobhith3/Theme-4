import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Branch,
  InventoryItem,
  ItemForecast,
  Recommendation,
  Supplier,
  PurchaseOrder,
  FeedEvent,
  RecommendationStatus,
  POStatus,
  StockTransaction,
  StockTransactionType,
  TransferOrder,
  TransferStatus,
  AutoApprovalRule
} from "@/types";

// Import Initial Mock Data
import { mockBranches } from "@/data/mock-branches";
import { mockInventory } from "@/data/mock-inventory";
import { mockForecasts } from "@/data/mock-forecasts";
import { mockRecommendations } from "@/data/mock-recommendations";
import { mockSuppliers } from "@/data/mock-suppliers";
import { mockFeedEvents } from "@/data/mock-feed";

// Ensure mock PurchaseOrders exist or initialize empty
const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: "po-1",
    poNumber: "PO-2026-0047",
    supplierId: "sup-1",
    supplierName: "FreshRoute Foods",
    branchId: "branch-hyd",
    branchName: "Hyderabad Central",
    status: "sent",
    totalAmount: 18420,
    expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lineItems: [
      { itemId: "inv-hyd-001", itemName: "Chicken Breast", quantity: 30, unit: "kg", unitPrice: 614, totalPrice: 18420 }
    ]
  },
  {
    id: "po-2",
    poNumber: "PO-2026-0048",
    supplierId: "sup-2",
    supplierName: "Metro Wholesale",
    branchId: "branch-sid",
    branchName: "Siddipet Main",
    status: "approved",
    totalAmount: 42100,
    expectedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lineItems: [
      { itemId: "inv-sid-002", itemName: "Cooking Oil", quantity: 120, unit: "L", unitPrice: 350.83, totalPrice: 42100 }
    ]
  },
  {
    id: "po-3",
    poNumber: "PO-2026-0049",
    supplierId: "sup-3",
    supplierName: "Prime Proteins",
    branchId: "branch-war",
    branchName: "Warangal",
    status: "draft",
    totalAmount: 6400,
    expectedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    lineItems: [
      { itemId: "inv-war-003", itemName: "Milk", quantity: 100, unit: "L", unitPrice: 64, totalPrice: 6400 }
    ]
  }
];

export interface AppSettings {
  organizationName: string;
  currency: string;
  leadTimeBuffer: number;
  sidebarCollapsed: boolean;
}

export interface ScenarioParams {
  demandChangePercent: number;
  supplierDelayDays: number;
}

export interface StoreState {
  branches: Branch[];
  inventory: InventoryItem[];
  forecasts: ItemForecast[];
  recommendations: Recommendation[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  feedEvents: (FeedEvent & { read?: boolean })[];
  settings: AppSettings;
  stockTransactions: StockTransaction[];
  transfers: TransferOrder[];
  autoApprovalRules: AutoApprovalRule[];

  // Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateAutoApprovalRule: (id: string, isEnabled: boolean) => void;
  markFeedEventRead: (id: string) => void;
  markAllFeedEventsRead: () => void;

  approveRecommendation: (id: string, customPayload?: { type?: "procure" | "transfer" | "hybrid" | "reduce", purchaseQty?: number, transferQty?: number }) => void;
  rejectRecommendation: (id: string, reason?: string) => void;
  modifyRecommendation: (id: string, payload: Partial<Recommendation>) => void;
  batchApproveRecommendations: (ids: string[]) => void;

  createPurchaseOrder: (po: Omit<PurchaseOrder, "id" | "poNumber" | "createdAt">) => void;
  updatePurchaseOrderStatus: (id: string, status: POStatus) => void;
  receivePurchaseOrderStock: (poId: string, receivedItems: { itemId: string, quantity: number, expiryDate?: string }[]) => void;

  createTransferOrder: (transfer: Omit<TransferOrder, "id" | "createdAt">) => void;
  updateTransferOrderStatus: (id: string, status: TransferStatus) => void;
  dispatchTransferOrder: (id: string) => void;
  receiveTransferOrder: (id: string) => void;

  recordStockTransaction: (payload: {
    type: StockTransactionType;
    itemId: string;
    itemName: string;
    branchId: string;
    branchName: string;
    quantityChange: number;
    unit: string;
    reason?: string;
    reference?: string;
    createdBy: string;
  }) => void;

  addInventoryItem: (item: InventoryItem) => void;

  runScenario: (itemId: string, branchId: string, params: ScenarioParams) => void;
  resetToDefault: () => void;
  hydrateFromServer: (data: { branches?: Branch[], inventory?: InventoryItem[], suppliers?: Supplier[] }) => void;
}

const defaultSettings: AppSettings = {
  organizationName: "ProcureIQ Global",
  currency: "USD",
  leadTimeBuffer: 3,
  sidebarCollapsed: false,
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      branches: mockBranches,
      inventory: mockInventory,
      forecasts: mockForecasts,
      recommendations: mockRecommendations,
      suppliers: mockSuppliers,
      purchaseOrders: initialPurchaseOrders,
      feedEvents: mockFeedEvents,
      settings: defaultSettings,
      stockTransactions: [],
      transfers: [],
      autoApprovalRules: [
        {
          id: "rule-1",
          name: "Routine Supplies Auto-Approval",
          description: "Automatically approve POs under ₹5000 for preferred suppliers",
          isEnabled: true,
          criteria: { maxSpend: 5000, supplierReliabilityMin: 90 }
        },
        {
          id: "rule-2",
          name: "Short-Distance Transfers",
          description: "Auto-approve transfers if distance < 20km and confidence > 90%",
          isEnabled: false,
          criteria: { maxTransferDistanceKm: 20, confidenceThreshold: 90 }
        }
      ],

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      updateAutoApprovalRule: (id, isEnabled) =>
        set((state) => ({
          autoApprovalRules: state.autoApprovalRules.map((rule) =>
            rule.id === id ? { ...rule, isEnabled } : rule
          ),
        })),

      markFeedEventRead: (id) =>
        set((state) => ({
          feedEvents: state.feedEvents.map((e) =>
            e.id === id ? { ...e, read: true } : e
          ),
        })),

      markAllFeedEventsRead: () =>
        set((state) => ({
          feedEvents: state.feedEvents.map((e) => ({ ...e, read: true })),
        })),

      approveRecommendation: (id, customPayload) => {
        set((state) => {
          const rec = state.recommendations.find((r) => r.id === id);
          if (!rec) return state;

          const updatedRecs = state.recommendations.map((r) => {
            if (r.id === id) {
              return {
                ...r,
                status: "approved" as RecommendationStatus,
                ...(customPayload ? {
                  type: customPayload.type || r.type,
                  suggestedQty: customPayload.purchaseQty || customPayload.transferQty || r.suggestedQty,
                  hybridDetails: customPayload.type === 'hybrid' ? {
                    transferQty: customPayload.transferQty || r.hybridDetails?.transferQty || 0,
                    purchaseQty: customPayload.purchaseQty || r.hybridDetails?.purchaseQty || 0,
                  } : r.hybridDetails
                } : {})
              };
            }
            return r;
          });

          // If it's a procure or hybrid recommendation, auto-generate a draft PO
          const finalType = customPayload?.type || rec.type;
          const finalPurchaseQty = customPayload?.purchaseQty || (finalType === 'hybrid' ? rec.hybridDetails?.purchaseQty : rec.suggestedQty) || 0;

          let newPOs = state.purchaseOrders;
          if ((finalType === "procure" || finalType === "hybrid") && rec.supplierId && finalPurchaseQty > 0) {
            const supplier = state.suppliers.find((s) => s.id === rec.supplierId);
            const po: PurchaseOrder = {
              id: `PO-${Date.now()}`,
              poNumber: `PO-2026-${Math.floor(Math.random() * 9000) + 1000}`,
              supplierId: rec.supplierId,
              supplierName: supplier?.name || rec.supplierName || "Unknown Supplier",
              branchId: rec.branchId,
              branchName: rec.branchName,
              status: "draft",
              totalAmount: rec.estimatedCost,
              expectedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              createdAt: new Date().toISOString(),
              lineItems: [
                {
                  itemId: rec.itemId,
                  itemName: rec.itemName,
                  quantity: finalPurchaseQty,
                  unit: rec.unit,
                  unitPrice: rec.estimatedCost / (rec.suggestedQty || 1),
                  totalPrice: rec.estimatedCost,
                },
              ],
            };
            newPOs = [po, ...state.purchaseOrders];
          }

          let newTransfers = state.transfers;
          const finalTransferQty = customPayload?.transferQty || (finalType === 'hybrid' ? rec.hybridDetails?.transferQty : rec.suggestedQty) || 0;
          
          if ((finalType === "transfer" || finalType === "hybrid") && rec.sourceBranchId && finalTransferQty > 0) {
            const tOrder: TransferOrder = {
              id: `TRN-${Date.now()}`,
              sourceBranchId: rec.sourceBranchId,
              sourceBranchName: rec.sourceBranchName || "Unknown Source",
              destinationBranchId: rec.branchId,
              destinationBranchName: rec.branchName,
              itemId: rec.itemId,
              itemName: rec.itemName,
              quantity: finalTransferQty,
              unit: rec.unit,
              expectedArrivalDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              transportCost: rec.transferFeasibility?.transferCost || 0,
              coldStorageRequired: false,
              linkedDecisionId: rec.id,
              status: "approved",
              createdAt: new Date().toISOString()
            };
            newTransfers = [tOrder, ...state.transfers];
          }

          return {
            recommendations: updatedRecs,
            purchaseOrders: newPOs,
            transfers: newTransfers,
          };
        });
      },

      batchApproveRecommendations: (ids) => 
        set((state) => {
          const updatedRecs = state.recommendations.map(r => 
            ids.includes(r.id) ? { ...r, status: "approved" as RecommendationStatus } : r
          );
          
          // Generate POs for procured ones
          const newPOs: PurchaseOrder[] = [];
          const newTransfers: TransferOrder[] = [];
          
          ids.forEach(id => {
            const rec = state.recommendations.find(r => r.id === id);
            if (!rec) return;
            
            if ((rec.type === "procure" || rec.type === "hybrid") && rec.supplierId) {
              const qty = rec.type === 'hybrid' ? (rec.hybridDetails?.purchaseQty || 0) : (rec.suggestedQty || 0);
              if (qty > 0) {
                newPOs.push({
                  id: `PO-${Date.now()}-${Math.random()}`,
                  poNumber: `PO-2026-${Math.floor(Math.random() * 9000) + 1000}`,
                  supplierId: rec.supplierId,
                  supplierName: rec.supplierName || "Unknown Supplier",
                  branchId: rec.branchId,
                  branchName: rec.branchName,
                  status: "draft",
                  totalAmount: rec.estimatedCost,
                  expectedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                  createdAt: new Date().toISOString(),
                  lineItems: [{
                    itemId: rec.itemId,
                    itemName: rec.itemName,
                    quantity: qty,
                    unit: rec.unit,
                    unitPrice: rec.estimatedCost / (rec.suggestedQty || 1),
                    totalPrice: rec.estimatedCost,
                  }]
                });
              }
            }

            if ((rec.type === "transfer" || rec.type === "hybrid") && rec.sourceBranchId) {
              const qty = rec.type === 'hybrid' ? (rec.hybridDetails?.transferQty || 0) : (rec.suggestedQty || 0);
              if (qty > 0) {
                newTransfers.push({
                  id: `TRN-${Date.now()}-${Math.random()}`,
                  sourceBranchId: rec.sourceBranchId,
                  sourceBranchName: rec.sourceBranchName || "Unknown Source",
                  destinationBranchId: rec.branchId,
                  destinationBranchName: rec.branchName,
                  itemId: rec.itemId,
                  itemName: rec.itemName,
                  quantity: qty,
                  unit: rec.unit,
                  expectedArrivalDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                  transportCost: rec.transferFeasibility?.transferCost || 0,
                  coldStorageRequired: false,
                  linkedDecisionId: rec.id,
                  status: "approved",
                  createdAt: new Date().toISOString()
                });
              }
            }
          });
          
          return {
            recommendations: updatedRecs,
            purchaseOrders: [...newPOs, ...state.purchaseOrders],
            transfers: [...newTransfers, ...state.transfers]
          };
        }),

      rejectRecommendation: (id, reason) =>
        set((state) => ({
          recommendations: state.recommendations.map((r) =>
            r.id === id ? { ...r, status: "rejected", reasoning: reason ? `Rejected: ${reason}` : r.reasoning } : r
          ),
        })),

      modifyRecommendation: (id, payload) =>
        set((state) => ({
          recommendations: state.recommendations.map((r) =>
            r.id === id ? { ...r, ...payload, reasoning: `Modified by manager. ${r.reasoning}` } : r
          ),
        })),

      createPurchaseOrder: (poPayload) =>
        set((state) => {
          const newPO: PurchaseOrder = {
            ...poPayload,
            id: `PO-${Date.now()}`,
            poNumber: `PO-2026-${Math.floor(Math.random() * 9000) + 1000}`,
            createdAt: new Date().toISOString(),
          };
          return {
            purchaseOrders: [newPO, ...state.purchaseOrders],
          };
        }),

      updatePurchaseOrderStatus: (id, status) =>
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((po) =>
            po.id === id ? { ...po, status } : po
          ),
        })),

      receivePurchaseOrderStock: (poId, receivedItems) =>
        set((state) => {
          const po = state.purchaseOrders.find(p => p.id === poId);
          if (!po) return state;

          const updatedInventory = [...state.inventory];
          const newTransactions: StockTransaction[] = [];

          receivedItems.forEach(ri => {
            const idx = updatedInventory.findIndex(i => i.id === ri.itemId && i.branchId === po.branchId);
            if (idx > -1) {
              const item = updatedInventory[idx];
              const balanceAfter = item.currentStock + ri.quantity;
              updatedInventory[idx] = { 
                ...item, 
                currentStock: balanceAfter,
                lastRestocked: new Date().toISOString().split('T')[0],
                expiryDate: ri.expiryDate || item.expiryDate
              };

              newTransactions.push({
                id: `txn-${Date.now()}-${Math.random()}`,
                date: new Date().toISOString(),
                type: "po_receipt",
                itemId: item.id,
                itemName: item.name,
                branchId: po.branchId,
                branchName: po.branchName,
                quantityIn: ri.quantity,
                quantityOut: 0,
                balanceAfter,
                unit: item.unit,
                reference: po.poNumber,
                reason: "PO Receipt",
                createdBy: "Warehouse Staff"
              });
            }
          });

          return {
            inventory: updatedInventory,
            stockTransactions: [...newTransactions, ...state.stockTransactions],
            purchaseOrders: state.purchaseOrders.map((p) =>
              p.id === poId ? { ...p, status: "fulfilled" } : p
            ),
          };
        }),

      createTransferOrder: (transfer) =>
        set((state) => ({
          transfers: [
            {
              ...transfer,
              id: `TRN-${Date.now()}`,
              createdAt: new Date().toISOString()
            },
            ...state.transfers
          ]
        })),

      updateTransferOrderStatus: (id, status) =>
        set((state) => ({
          transfers: state.transfers.map((t) =>
            t.id === id ? { ...t, status } : t
          )
        })),

      dispatchTransferOrder: (id) =>
        set((state) => {
          const t = state.transfers.find(trn => trn.id === id);
          if (!t) return state;

          const updatedInventory = [...state.inventory];
          const newTransactions: StockTransaction[] = [];

          const sourceIdx = updatedInventory.findIndex(i => i.id === t.itemId && i.branchId === t.sourceBranchId);
          if (sourceIdx > -1) {
            const item = updatedInventory[sourceIdx];
            const balanceAfter = item.currentStock - t.quantity;
            updatedInventory[sourceIdx] = { ...item, currentStock: balanceAfter };

            newTransactions.push({
              id: `txn-${Date.now()}-${Math.random()}`,
              date: new Date().toISOString(),
              type: "transfer_out",
              itemId: item.id,
              itemName: item.name,
              branchId: t.sourceBranchId,
              branchName: t.sourceBranchName,
              quantityIn: 0,
              quantityOut: t.quantity,
              balanceAfter,
              unit: item.unit,
              reference: t.id,
              reason: `Dispatched to ${t.destinationBranchName}`,
              createdBy: "Store Manager"
            });
          }

          return {
            inventory: updatedInventory,
            stockTransactions: [...newTransactions, ...state.stockTransactions],
            transfers: state.transfers.map(trn => trn.id === id ? { ...trn, status: "dispatched" } : trn)
          };
        }),

      receiveTransferOrder: (id) =>
        set((state) => {
          const t = state.transfers.find(trn => trn.id === id);
          if (!t) return state;

          const updatedInventory = [...state.inventory];
          const newTransactions: StockTransaction[] = [];

          const destIdx = updatedInventory.findIndex(i => i.id === t.itemId && i.branchId === t.destinationBranchId);
          if (destIdx > -1) {
            const item = updatedInventory[destIdx];
            const balanceAfter = item.currentStock + t.quantity;
            updatedInventory[destIdx] = { ...item, currentStock: balanceAfter };

            newTransactions.push({
              id: `txn-${Date.now()}-${Math.random()}`,
              date: new Date().toISOString(),
              type: "transfer_in",
              itemId: item.id,
              itemName: item.name,
              branchId: t.destinationBranchId,
              branchName: t.destinationBranchName,
              quantityIn: t.quantity,
              quantityOut: 0,
              balanceAfter,
              unit: item.unit,
              reference: t.id,
              reason: `Received from ${t.sourceBranchName}`,
              createdBy: "Store Manager"
            });
          }

          return {
            inventory: updatedInventory,
            stockTransactions: [...newTransactions, ...state.stockTransactions],
            transfers: state.transfers.map(trn => trn.id === id ? { ...trn, status: "received" } : trn)
          };
        }),

      runScenario: (itemId, branchId, params) => {
        // Very basic mock logic for scenario simulator
        // In a real app this would call an AI backend or use a robust formula
        set((state) => {
          const forecasts = [...state.forecasts];
          const forecastIdx = forecasts.findIndex(f => f.itemId === itemId && f.branchId === branchId);
          if (forecastIdx > -1) {
            const f = { ...forecasts[forecastIdx] };
          }
          return { forecasts };
        });
      },

      recordStockTransaction: (payload) =>
        set((state) => {
          // Find current stock
          const item = state.inventory.find(i => i.id === payload.itemId && i.branchId === payload.branchId);
          const currentStock = item ? item.currentStock : 0;
          const balanceAfter = currentStock + payload.quantityChange;

          const newTransaction: StockTransaction = {
            id: `txn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            date: new Date().toISOString(),
            type: payload.type,
            itemId: payload.itemId,
            itemName: payload.itemName,
            branchId: payload.branchId,
            branchName: payload.branchName,
            quantityIn: payload.quantityChange > 0 ? payload.quantityChange : 0,
            quantityOut: payload.quantityChange < 0 ? Math.abs(payload.quantityChange) : 0,
            balanceAfter,
            unit: payload.unit,
            reason: payload.reason,
            reference: payload.reference,
            createdBy: payload.createdBy
          };

          // Update inventory
          const updatedInventory = state.inventory.map(i => {
            if (i.id === payload.itemId && i.branchId === payload.branchId) {
              return { ...i, currentStock: balanceAfter };
            }
            return i;
          });

          return {
            inventory: updatedInventory,
            stockTransactions: [newTransaction, ...state.stockTransactions]
          };
        }),

      addInventoryItem: (item) =>
        set((state) => ({
          inventory: [item, ...state.inventory]
        })),

      resetToDefault: () =>
        set({
          branches: mockBranches,
          inventory: mockInventory,
          forecasts: mockForecasts,
          recommendations: mockRecommendations,
          suppliers: mockSuppliers,
          purchaseOrders: initialPurchaseOrders,
          feedEvents: mockFeedEvents,
          settings: defaultSettings,
        }),
      hydrateFromServer: (data) =>
        set((state) => ({
          ...state,
          ...(data.branches && { branches: data.branches }),
          ...(data.inventory && { inventory: data.inventory }),
          ...(data.suppliers && { suppliers: data.suppliers }),
        })),
    }),
    {
      name: "procureiq-storage",
    }
  )
);
