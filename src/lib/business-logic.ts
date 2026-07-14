export interface TransferFeasibilityInput {
  sourceBranch: string;
  destinationBranch: string;
  distanceKm: number;
  estimatedTravelTimeHours: number;
  transportCost: number;
  itemName: string;
  itemCategory: string;
  quantityKgOrUnits: number;
  itemPerishability: "low" | "medium" | "high";
  coldStorageRequired: boolean;
  donorCurrentStock: number;
  donorSafetyStock: number;
  donorForecastDemand: number;
  destinationShortage: number;
  localSupplierCost: number;
  supplierLeadTimeHours: number;
  purchaseCost: number;
  urgencyHoursUntilBreach: number;
}

export interface TransferFeasibilityResult {
  feasible: boolean;
  recommendation: "transfer" | "purchase" | "hybrid" | "not_recommended";
  transferScore: number;
  costComparison: {
    transferCost: number;
    purchaseCost: number;
    savings: number;
  };
  timeComparison: {
    transferTime: number;
    supplierTime: number;
  };
  riskLevel: "low" | "medium" | "high" | "critical";
  reasonSummary: string;
  blockingReasons: string[];
  supportingReasons: string[];
}

export function evaluateTransferFeasibility(input: TransferFeasibilityInput): TransferFeasibilityResult {
  const blockingReasons: string[] = [];
  const supportingReasons: string[] = [];
  let score = 100;
  let riskLevel: "low" | "medium" | "high" | "critical" = "low";

  // 1. Donor Stock Check
  const availableToTransfer = input.donorCurrentStock - input.donorSafetyStock - input.donorForecastDemand;
  if (availableToTransfer <= 0) {
    blockingReasons.push(`Source branch (${input.sourceBranch}) does not have enough excess stock.`);
    score -= 100;
  } else if (availableToTransfer < input.quantityKgOrUnits) {
    supportingReasons.push(`Source branch can only safely transfer ${availableToTransfer} units/kg.`);
    score -= 30;
  } else {
    supportingReasons.push(`Source branch has enough excess stock to safely transfer ${input.quantityKgOrUnits} units/kg.`);
  }

  // 2. Urgency & Time Check
  if (input.estimatedTravelTimeHours > input.urgencyHoursUntilBreach) {
    blockingReasons.push(`Transfer time (${input.estimatedTravelTimeHours}h) exceeds urgency window (${input.urgencyHoursUntilBreach}h).`);
    score -= 100;
  } else if (input.estimatedTravelTimeHours < input.supplierLeadTimeHours) {
    supportingReasons.push(`Transfer is faster than local supplier lead time.`);
  }

  // 3. Cost Check
  const savings = input.purchaseCost - input.transportCost;
  if (input.transportCost > input.purchaseCost) {
    blockingReasons.push(`Transfer cost (₹${input.transportCost}) is higher than local purchase cost (₹${input.purchaseCost}).`);
    score -= 80;
  } else if (savings > 0) {
    supportingReasons.push(`Transfer saves ₹${savings} compared to local purchase.`);
  }

  // 4. Perishability & Cold Storage Risk
  if (input.itemPerishability === "high" && input.estimatedTravelTimeHours > 4 && input.coldStorageRequired) {
    blockingReasons.push(`High perishability item requires cold-chain transport for long distance, which adds risk.`);
    riskLevel = "high";
    score -= 50;
  } else if (input.itemPerishability === "high" && input.estimatedTravelTimeHours > 8) {
     blockingReasons.push(`Distance too far for high perishability item.`);
     riskLevel = "critical";
     score -= 80;
  }

  // Determine Final Recommendation
  const isFeasible = blockingReasons.length === 0 && score > 50;
  let recommendation: "transfer" | "purchase" | "hybrid" | "not_recommended" = "not_recommended";

  if (isFeasible) {
    if (availableToTransfer >= input.destinationShortage) {
      recommendation = "transfer";
    } else {
      recommendation = "hybrid";
    }
  } else {
    recommendation = "purchase";
  }

  // Final Reason Summary
  let reasonSummary = "";
  if (recommendation === "transfer") {
    reasonSummary = `Transfer is recommended because the source branch has excess stock, travel time is below the risk window, and transfer cost is lower than purchasing new inventory.`;
  } else if (recommendation === "hybrid") {
    reasonSummary = `Hybrid is recommended: source branch can safely provide a partial transfer, but the remaining shortage must be purchased locally.`;
  } else {
    reasonSummary = `Transfer rejected because ${blockingReasons.join(" ")}`;
  }

  return {
    feasible: isFeasible,
    recommendation,
    transferScore: Math.max(0, score),
    costComparison: {
      transferCost: input.transportCost,
      purchaseCost: input.purchaseCost,
      savings: isFeasible ? Math.max(0, savings) : 0,
    },
    timeComparison: {
      transferTime: input.estimatedTravelTimeHours,
      supplierTime: input.supplierLeadTimeHours,
    },
    riskLevel: isFeasible ? riskLevel : "critical",
    reasonSummary,
    blockingReasons,
    supportingReasons,
  };
}
