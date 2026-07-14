export type RecommendationType = "procure" | "transfer" | "reduce" | "expedite" | "hybrid";
export type RecommendationStatus = "pending" | "approved" | "rejected" | "executed" | "expired";
export type UrgencyLevel = "critical" | "high" | "medium" | "low";

export interface Recommendation {
  id: string;
  type: RecommendationType;
  itemId: string;
  itemName: string;
  branchId: string;
  branchName: string;
  urgency: UrgencyLevel;
  suggestedQty: number;
  unit: string;
  estimatedCost: number;
  estimatedSavings: number;
  reasoning: string;
  status: RecommendationStatus;
  createdAt: string;
  expiresAt: string;
  supplierId?: string;
  supplierName?: string;
  sourceBranchId?: string;
  sourceBranchName?: string;
  confidenceScore: number;
  timeToBreach?: string;
  transferFeasibility?: {
    feasible: boolean;
    distanceKm: number;
    travelTimeHours: number;
    transferCost: number;
    purchaseAvoided: number;
    reason: string;
  };
  hybridDetails?: {
    transferQty: number;
    purchaseQty: number;
  };
}

export type FeedEventType = "critical" | "warning" | "opportunity" | "info";

export interface FeedEvent {
  id: string;
  type: FeedEventType;
  title: string;
  itemName: string;
  branchName: string;
  description: string;
  metric?: string;
  metricValue?: string;
  actionLabel?: string;
  timestamp: string;
  estimatedImpact?: string;
}
