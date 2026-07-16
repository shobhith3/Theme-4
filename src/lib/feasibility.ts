export interface TransferFeasibilityInput {
  sourceBranch: string;
  destinationBranch: string;
  distanceKm: number;
  estimatedTravelTimeHours: number;
  transportCost: number;
  itemCategory: string;
  itemPerishability: 'high' | 'medium' | 'low';
  coldStorageRequired: boolean;
  quantityRequested: number;
  donorCurrentStock: number;
  donorSafetyStock: number;
  donorForecastDemand: number;
  destinationShortage: number;
  localPurchaseCost: number;
  supplierLeadTimeHours: number;
  urgencyHoursUntilBreach: number;
}

export interface TransferFeasibilityResult {
  feasible: boolean;
  recommendation: 'transfer' | 'purchase' | 'hybrid' | 'not_recommended';
  transferScore: number;
  costComparison: { transfer: number; purchase: number; savings: number };
  timeComparison: { transfer: number; purchase: number };
  riskLevel: 'low' | 'medium' | 'high';
  reasonSummary: string;
  blockingReasons: string[];
  supportingReasons: string[];
}

export function evaluateTransferFeasibility(input: TransferFeasibilityInput): TransferFeasibilityResult {
  const blockingReasons: string[] = [];
  const supportingReasons: string[] = [];
  
  const donorAvailableToTransfer = input.donorCurrentStock - input.donorSafetyStock;
  const quantityToTransfer = Math.min(input.quantityRequested, donorAvailableToTransfer);
  const purchaseAvoided = (input.localPurchaseCost / input.destinationShortage) * quantityToTransfer;
  const costSavings = purchaseAvoided - input.transportCost;

  // 1. Check if source branch has enough stock safely
  if (donorAvailableToTransfer <= 0) {
    blockingReasons.push(`Source branch (${input.sourceBranch}) will fall below safety stock.`);
  } else {
    supportingReasons.push(`Source branch remains safe after transferring ${quantityToTransfer}.`);
  }

  // 2. Check travel time vs urgency window
  if (input.estimatedTravelTimeHours > input.urgencyHoursUntilBreach) {
    blockingReasons.push(`Transfer takes ${input.estimatedTravelTimeHours}h, missing the ${input.urgencyHoursUntilBreach}h urgency window.`);
  } else {
    supportingReasons.push(`Transfer fits within the risk window.`);
  }

  // 3. Check cost effectiveness
  if (costSavings < 0) {
    blockingReasons.push(`Transfer cost (₹${input.transportCost}) is higher than local purchase cost (₹${purchaseAvoided.toFixed(0)}).`);
  } else {
    supportingReasons.push(`Transfer saves ₹${costSavings.toFixed(0)} compared to purchasing.`);
  }

  // 4. Perishability & Cold Storage Risk
  if (input.itemPerishability === 'high' && input.distanceKm > 150) {
    blockingReasons.push(`High perishability risk for long distance (${input.distanceKm}km).`);
  }
  
  if (input.coldStorageRequired && input.distanceKm > 200) {
    blockingReasons.push(`Cold chain risk is too high for this distance.`);
  }

  // Final Feasibility Decision
  const feasible = blockingReasons.length === 0 && quantityToTransfer > 0;
  
  let recommendation: TransferFeasibilityResult['recommendation'] = 'not_recommended';
  let reasonSummary = '';
  let transferScore = feasible ? 80 : 20;

  if (feasible) {
    if (quantityToTransfer >= input.destinationShortage) {
      recommendation = 'transfer';
      transferScore += 15;
      reasonSummary = `Transfer is recommended. Donor branch remains safe, cost is lower than purchase, and it covers the full shortage.`;
    } else {
      recommendation = 'hybrid';
      transferScore += 5;
      reasonSummary = `Transfer reduces purchase quantity and is feasible within the risk window, but transfer alone does not fully cover projected demand. Hybrid replenishment is recommended.`;
    }
  } else {
    recommendation = 'purchase';
    reasonSummary = `Transfer is not recommended because ${blockingReasons.join(' ')}`;
  }

  return {
    feasible,
    recommendation,
    transferScore: Math.min(100, Math.max(0, transferScore)),
    costComparison: {
      transfer: input.transportCost,
      purchase: purchaseAvoided,
      savings: costSavings
    },
    timeComparison: {
      transfer: input.estimatedTravelTimeHours,
      purchase: input.supplierLeadTimeHours
    },
    riskLevel: input.itemPerishability === 'high' ? 'high' : (input.distanceKm > 100 ? 'medium' : 'low'),
    reasonSummary,
    blockingReasons,
    supportingReasons
  };
}
