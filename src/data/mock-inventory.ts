import { InventoryItem } from "@/types";

export const mockInventory: InventoryItem[] = [
  // Hyderabad
  { id: "inv-hyd-001", name: "Chicken Breast", category: "protein", unit: "kg", branchId: "branch-hyd", currentStock: 8, minStock: 15, maxStock: 60, reorderPoint: 20, avgDailyUsage: 12, lastRestocked: "2026-07-04", expiryDate: "2026-07-09", unitCost: 280, shelfLifeDays: 5 },
  { id: "inv-hyd-002", name: "Paneer", category: "dairy", unit: "kg", branchId: "branch-hyd", currentStock: 5, minStock: 12, maxStock: 25, reorderPoint: 15, avgDailyUsage: 4, lastRestocked: "2026-07-05", expiryDate: "2026-07-10", unitCost: 320, shelfLifeDays: 5 },
  { id: "inv-hyd-003", name: "Tomatoes", category: "produce", unit: "kg", branchId: "branch-hyd", currentStock: 12, minStock: 20, maxStock: 50, reorderPoint: 25, avgDailyUsage: 8, lastRestocked: "2026-07-05", expiryDate: "2026-07-12", unitCost: 45, shelfLifeDays: 7 },
  { id: "inv-hyd-004", name: "Basmati Rice", category: "grain", unit: "kg", branchId: "branch-hyd", currentStock: 45, minStock: 60, maxStock: 150, reorderPoint: 70, avgDailyUsage: 10, lastRestocked: "2026-07-02", expiryDate: null, unitCost: 95, shelfLifeDays: null },
  { id: "inv-hyd-005", name: "Milk", category: "dairy", unit: "L", branchId: "branch-hyd", currentStock: 18, minStock: 30, maxStock: 60, reorderPoint: 35, avgDailyUsage: 10, lastRestocked: "2026-07-07", expiryDate: "2026-07-10", unitCost: 56, shelfLifeDays: 3 },
  { id: "inv-hyd-006", name: "Wheat Flour", category: "grain", unit: "kg", branchId: "branch-hyd", currentStock: 30, minStock: 20, maxStock: 60, reorderPoint: 25, avgDailyUsage: 5, lastRestocked: "2026-07-01", expiryDate: null, unitCost: 40, shelfLifeDays: null },
  { id: "inv-hyd-007", name: "Cooking Oil", category: "oil", unit: "L", branchId: "branch-hyd", currentStock: 40, minStock: 15, maxStock: 50, reorderPoint: 20, avgDailyUsage: 5, lastRestocked: "2026-07-03", expiryDate: null, unitCost: 160, shelfLifeDays: null },
  { id: "inv-hyd-008", name: "French Fries", category: "frozen", unit: "kg", branchId: "branch-hyd", currentStock: 25, minStock: 15, maxStock: 40, reorderPoint: 20, avgDailyUsage: 4, lastRestocked: "2026-07-01", expiryDate: "2026-10-01", unitCost: 180, shelfLifeDays: 90 },
  { id: "inv-hyd-009", name: "Frozen Peas", category: "frozen", unit: "kg", branchId: "branch-hyd", currentStock: 10, minStock: 5, maxStock: 20, reorderPoint: 8, avgDailyUsage: 2, lastRestocked: "2026-07-01", expiryDate: "2026-10-01", unitCost: 150, shelfLifeDays: 90 },
  { id: "inv-hyd-010", name: "Mineral Water", category: "beverage", unit: "bottle", branchId: "branch-hyd", currentStock: 120, minStock: 50, maxStock: 300, reorderPoint: 80, avgDailyUsage: 20, lastRestocked: "2026-07-05", expiryDate: null, unitCost: 15, shelfLifeDays: null },
  { id: "inv-hyd-011", name: "Soft Drinks", category: "beverage", unit: "bottle", branchId: "branch-hyd", currentStock: 80, minStock: 40, maxStock: 200, reorderPoint: 60, avgDailyUsage: 15, lastRestocked: "2026-07-05", expiryDate: "2026-12-01", unitCost: 35, shelfLifeDays: 180 },
  { id: "inv-hyd-012", name: "Takeaway Boxes", category: "packaging", unit: "box", branchId: "branch-hyd", currentStock: 500, minStock: 200, maxStock: 1000, reorderPoint: 300, avgDailyUsage: 80, lastRestocked: "2026-06-25", expiryDate: null, unitCost: 5, shelfLifeDays: null },
  { id: "inv-hyd-013", name: "Paper Cups", category: "packaging", unit: "cup", branchId: "branch-hyd", currentStock: 800, minStock: 300, maxStock: 2000, reorderPoint: 500, avgDailyUsage: 100, lastRestocked: "2026-06-25", expiryDate: null, unitCost: 2, shelfLifeDays: null },
  { id: "inv-hyd-014", name: "Dishwash Liquid", category: "cleaning", unit: "L", branchId: "branch-hyd", currentStock: 15, minStock: 5, maxStock: 25, reorderPoint: 8, avgDailyUsage: 0.5, lastRestocked: "2026-06-15", expiryDate: null, unitCost: 120, shelfLifeDays: null },
  { id: "inv-hyd-015", name: "Sanitizer", category: "cleaning", unit: "L", branchId: "branch-hyd", currentStock: 5, minStock: 2, maxStock: 10, reorderPoint: 3, avgDailyUsage: 0.2, lastRestocked: "2026-06-15", expiryDate: null, unitCost: 250, shelfLifeDays: null },

  // Siddipet (keeping minimal items for transfers)
  { id: "inv-sdp-001", name: "Chicken Breast", category: "protein", unit: "kg", branchId: "branch-sdp", currentStock: 14, minStock: 10, maxStock: 40, reorderPoint: 15, avgDailyUsage: 8, lastRestocked: "2026-07-05", expiryDate: "2026-07-10", unitCost: 275, shelfLifeDays: 5 },
  
  // Warangal (Transfer Source for Tomatoes & Milk & Chicken Breast)
  { id: "inv-wgl-001", name: "Chicken Breast", category: "protein", unit: "kg", branchId: "branch-wgl", currentStock: 45, minStock: 12, maxStock: 45, reorderPoint: 18, avgDailyUsage: 9, lastRestocked: "2026-07-06", expiryDate: "2026-07-11", unitCost: 270, shelfLifeDays: 5 },
  { id: "inv-wgl-002", name: "Tomatoes", category: "produce", unit: "kg", branchId: "branch-wgl", currentStock: 35, minStock: 10, maxStock: 40, reorderPoint: 14, avgDailyUsage: 7, lastRestocked: "2026-07-06", expiryDate: "2026-07-13", unitCost: 40, shelfLifeDays: 7 },
  { id: "inv-wgl-003", name: "Milk", category: "dairy", unit: "L", branchId: "branch-wgl", currentStock: 40, minStock: 10, maxStock: 50, reorderPoint: 15, avgDailyUsage: 5, lastRestocked: "2026-07-06", expiryDate: "2026-07-13", unitCost: 55, shelfLifeDays: 3 },
];
