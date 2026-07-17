export interface DailyConsumption {
  date: Date;
  quantity: number;
}

export interface SupplierOption {
  type: 'PURCHASE';
  supplierId: string;
  name: string;
  reliability: number;
  leadTimeDays: number;
  unitCost: number;
  minOrderQty: number;
}

export interface TransferOption {
  type: 'TRANSFER';
  donorBranchId: string;
  name: string;
  donorCurrentStock: number;
  donorSafeStock: number;
  travelTimeDays: number;
  coldChainAvailable: boolean;
}

export type EngineOption = SupplierOption | TransferOption | HybridOption;

export interface HybridOption {
  type: 'HYBRID';
  transferOption: TransferOption;
  purchaseOption: SupplierOption;
  transferQuantity: number;
  purchaseQuantity: number;
}

export interface EngineInput {
  itemSku: string;
  itemName: string;
  branchName: string;
  category: string;
  
  history: DailyConsumption[];
  
  currentStock: number;
  reservedStock: number;
  expiredOrDamaged: number;
  confirmedIncoming: number;
  
  safeStock: number;
  safeCoverDays: number;
  leadTime: number; // Primary supplier lead time
  
  unitRevenue: number;
  riskWindowDays: number;
  
  currentDate: Date;
  festivalWindowStart?: Date;
  festivalWindowEnd?: Date;
  festivalMultiplier?: number;
  
  transferOptions: TransferOption[];
  purchaseOptions: SupplierOption[];
}

export interface OptionScore {
  option: EngineOption;
  totalScore: number;
  feasible: boolean;
  blockingReason?: string;
  
  breakdown: {
    urgencyFit: number;
    riskReduction: number;
    revenueProtection: number;
    supplierReliability: number;
    transferFeasibility: number;
    costEfficiency: number;
    overstockRisk: number;
    expiryRisk: number;
    donorBranchRisk: number;
  };
  
  recommendedQuantity: number; // How much to procure/transfer
}

export interface EngineOutput {
  forecast: {
    baseDemand: number;
    dowFactor: number;
    trendFactor: number;
    festivalFactor: number;
    expectedDailyDemand: number;
  };
  confidence: number;
  metrics: {
    usableStock: number;
    stockCover: number;
    timeToBreach: number;
    revenueAtRisk: number;
  };
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  scoredOptions: OptionScore[];
  chosenOption: OptionScore | null;
  storedDecision?: any; // The prisma Decision record
}
