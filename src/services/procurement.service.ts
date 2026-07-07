import { useStore } from "@/store/useStore";
import type { Recommendation } from "@/types";
export function getPendingRecommendations(branchId?: string): Recommendation[] {
  const recs = useStore.getState().recommendations.filter((r) => r.status === "pending");
  if (branchId) return recs.filter((r) => r.branchId === branchId);
  return recs;
}

export function getRecommendationsByType(type: Recommendation["type"], branchId?: string): Recommendation[] {
  const recs = useStore.getState().recommendations.filter((r) => r.type === type);
  if (branchId) return recs.filter((r) => r.branchId === branchId);
  return recs;
}

export function getTotalOverstockCapital(branchId?: string): number {
  const items = branchId
    ? useStore.getState().inventory.filter((i) => i.branchId === branchId)
    : useStore.getState().inventory;

  return items.reduce((sum, item) => {
    const excess = Math.max(0, item.currentStock - item.maxStock);
    // Also count items significantly above reorder point that may be overstocked
    const softExcess = Math.max(0, item.currentStock - (item.maxStock * 0.85));
    return sum + (excess > 0 ? excess : softExcess) * item.unitCost;
  }, 0);
}

export function getAISavings(branchId?: string): number {
  const recs = branchId
    ? useStore.getState().recommendations.filter((r) => r.branchId === branchId || r.sourceBranchId === branchId)
    : useStore.getState().recommendations;

  return recs.reduce((sum, r) => sum + r.estimatedSavings, 0);
}

export function getSavingsOpportunityCount(branchId?: string): number {
  const recs = branchId
    ? useStore.getState().recommendations.filter((r) => r.branchId === branchId || r.sourceBranchId === branchId)
    : useStore.getState().recommendations;

  return recs.filter((r) => r.estimatedSavings > 0).length;
}
