export type POStatus = "draft" | "pending_approval" | "approved" | "sent" | "acknowledged" | "fulfilled" | "cancelled";

export interface POLineItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  branchId: string;
  branchName: string;
  lineItems: POLineItem[];
  status: POStatus;
  totalAmount: number;
  expectedDeliveryDate: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}
