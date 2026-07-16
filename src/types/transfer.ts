export type TransferStatus = "draft" | "approved" | "dispatched" | "in_transit" | "received" | "cancelled";

export interface TransferOrder {
  id: string;
  sourceBranchId: string;
  sourceBranchName: string;
  destinationBranchId: string;
  destinationBranchName: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  expectedArrivalDate: string;
  transportCost: number;
  coldStorageRequired: boolean;
  linkedDecisionId?: string;
  status: TransferStatus;
  createdAt: string;
}
