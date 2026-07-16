export type StockTransactionType = 
  | 'opening_stock'
  | 'receive_stock'
  | 'transfer_in'
  | 'transfer_out'
  | 'consumption'
  | 'adjustment'
  | 'wastage'
  | 'expiry'
  | 'damage'
  | 'po_receipt';

export interface StockTransaction {
  id: string;
  date: string;
  type: StockTransactionType;
  itemId: string;
  itemName: string;
  branchId: string;
  branchName: string;
  quantityIn: number;
  quantityOut: number;
  balanceAfter: number;
  unit: string;
  reason?: string;
  reference?: string; // e.g., PO number, invoice number, transfer ID
  createdBy: string;
}
