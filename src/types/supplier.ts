export interface Supplier {
  id: string;
  name: string;
  rating: number;
  reliabilityScore: number;
  avgLeadTimeDays: number;
  minOrderValue: number;
  paymentTerms: string;
  contactEmail: string;
  contactPhone: string;
  itemCategories: string[];
  isPreferred: boolean;
  onTimeDeliveryRate: number;
  defectRate: number;
}
