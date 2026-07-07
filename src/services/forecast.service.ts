import { useStore } from "@/store/useStore";
import type { InventoryItem, ItemForecast } from "@/types";
export interface StockoutRisk {
  item: InventoryItem;
  daysUntilStockout: number;
  riskLevel: "critical" | "high" | "medium" | "low";
  revenueAtRisk: number;
}

export function calculateDaysUntilStockout(item: InventoryItem): number {
  if (item.avgDailyUsage <= 0) return Infinity;
  return item.currentStock / item.avgDailyUsage;
}

export function getStockoutRisks(branchId?: string): StockoutRisk[] {
  const items = branchId
    ? useStore.getState().inventory.filter((i) => i.branchId === branchId)
    : useStore.getState().inventory;

  return items
    .map((item) => {
      const days = calculateDaysUntilStockout(item);
      let riskLevel: StockoutRisk["riskLevel"] = "low";
      if (days <= 1) riskLevel = "critical";
      else if (days <= 2) riskLevel = "high";
      else if (days <= 3) riskLevel = "medium";

      // Estimate revenue at risk: unit cost * avg daily usage * days of disruption (assume 2 days)
      const revenueAtRisk = item.unitCost * item.avgDailyUsage * 2;

      return { item, daysUntilStockout: days, riskLevel, revenueAtRisk };
    })
    .filter((r) => r.daysUntilStockout <= 5)
    .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
}

export function getForecastsForBranch(branchId: string): ItemForecast[] {
  return useStore.getState().forecasts.filter((f) => f.branchId === branchId);
}

export function getAllForecasts(): ItemForecast[] {
  return useStore.getState().forecasts;
}

export function getForecastSeries(itemName: string) {
  const forecast = useStore.getState().forecasts.find((f) => f.itemName === itemName);
  if (!forecast) return [];
  return forecast.dataPoints;
}

export function getTotalRevenueAtRisk(branchId?: string): number {
  const risks = getStockoutRisks(branchId);
  return risks.reduce((sum, r) => sum + r.revenueAtRisk, 0);
}

export function getPredictedStockoutCount(branchId?: string): number {
  const risks = getStockoutRisks(branchId);
  return risks.length;
}

export function getCriticalStockoutCount(branchId?: string): number {
  const risks = getStockoutRisks(branchId);
  return risks.filter((r) => r.riskLevel === "critical").length;
}
