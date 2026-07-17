export type ItemCategory = "protein" | "dairy" | "produce" | "grain" | "oil" | "spice" | "frozen" | "beverage" | "packaging" | "cleaning" | "other";
export type ItemUnit = "kg" | "litre" | "L" | "dozen" | "units" | "grams" | "bottle" | "box" | "cup";

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  unit: ItemUnit;
  branchId: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  avgDailyUsage: number;
  lastRestocked: string;
  expiryDate: string | null;
  unitCost: number;
  shelfLifeDays: number | null;
}

export interface InventorySnapshot {
  itemId: string;
  branchId: string;
  date: string;
  openingStock: number;
  consumed: number;
  received: number;
  wasted: number;
  closingStock: number;
}
