export interface AutoApprovalRule {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  criteria: {
    maxSpend?: number;
    supplierReliabilityMin?: number;
    requireApprovalForPerishables?: boolean;
    requireApprovalLowConfidence?: boolean;
    confidenceThreshold?: number;
    maxTransferDistanceKm?: number;
  };
}
