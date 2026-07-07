export const mockDecisions = [
  {
    id: "D-2048",
    item: "Chicken Breast",
    branch: "Hyderabad Central",
    status: "Critical",
    revenueExposed: 33600,
    timeToBreach: "46 hrs",
    confidence: 92,
    strategyType: "Hybrid replenishment",
    strategyDetails: [
      { action: "Transfer", amount: "18 kg", source: "Warangal", destination: "Hyderabad Central" },
      { action: "Purchase", amount: "22 kg", source: "FreshRoute Foods", destination: "" }
    ],
    netProtection: 31410
  },
  {
    id: "D-2049",
    item: "Tomatoes",
    branch: "Siddipet Main",
    status: "High",
    revenueExposed: 2140,
    timeToBreach: "1.2 days",
    confidence: 95,
    strategyType: "Inter-branch transfer",
    strategyDetails: [
      { action: "Transfer", amount: "18 kg", source: "Warangal", destination: "Siddipet Main" }
    ],
    netProtection: 2140
  },
  {
    id: "D-2050",
    item: "Cooking Oil",
    branch: "Siddipet Main",
    status: "Medium",
    revenueExposed: 12800,
    timeToBreach: "3.4 days",
    confidence: 88,
    strategyType: "Purchase recommendation",
    strategyDetails: [
      { action: "Purchase", amount: "40 L", source: "Metro Wholesale", destination: "" }
    ],
    netProtection: 12800
  }
];

export const mockInventory = [
  { id: "INV-1", item: "Chicken Breast", category: "Protein", branch: "Hyderabad Central", onHand: "24 kg", incoming: "0", daysCover: "1.9", safetyStock: "10 kg", demandTrend: "+38%", status: "Critical", action: "Review Decision" },
  { id: "INV-2", item: "Tomatoes", category: "Produce", branch: "Siddipet Main", onHand: "11 kg", incoming: "0", daysCover: "1.2", safetyStock: "8 kg", demandTrend: "+14%", status: "High", action: "Transfer Available" },
  { id: "INV-3", item: "Paneer", category: "Dairy", branch: "Hyderabad Central", onHand: "42 kg", incoming: "12 kg", daysCover: "8.4", safetyStock: "15 kg", demandTrend: "-6%", status: "Overstock", action: "Reduce Order" },
  { id: "INV-4", item: "Milk", category: "Dairy", branch: "Warangal", onHand: "14 L", incoming: "0", daysCover: "1.0", safetyStock: "20 L", demandTrend: "+5%", status: "High", action: "Purchase" },
  { id: "INV-5", item: "Fresh Cream", category: "Dairy", branch: "Siddipet Main", onHand: "8 L", incoming: "0", daysCover: "2.4", safetyStock: "5 L", demandTrend: "+2%", status: "Monitored", action: "Review" },
];

export const mockSuppliers = [
  { id: "SUP-1", name: "FreshRoute Foods", categories: "Produce, Protein", priceIndex: "98", onTime: "94.2%", quality: "9.8/10", leadTime: "1.2 days", fulfillment: "99%", aiScore: "95", risk: "Low" },
  { id: "SUP-2", name: "Metro Wholesale", categories: "Pantry, Oil", priceIndex: "102", onTime: "98.1%", quality: "9.5/10", leadTime: "0.5 days", fulfillment: "97%", aiScore: "92", risk: "Low" },
  { id: "SUP-3", name: "Prime Proteins", categories: "Protein", priceIndex: "95", onTime: "82.4%", quality: "9.1/10", leadTime: "2.4 days", fulfillment: "88%", aiScore: "74", risk: "High" },
  { id: "SUP-4", name: "Deccan Produce Co.", categories: "Produce", priceIndex: "88", onTime: "89.5%", quality: "8.4/10", leadTime: "1.8 days", fulfillment: "92%", aiScore: "81", risk: "Medium" },
];

export const mockOrders = [
  { id: "PO-2026-0047", supplier: "FreshRoute Foods", branch: "Hyderabad Central", items: "3", value: "₹18,420", delivery: "10 Jul", status: "In Transit", owner: "Sanjay A." },
  { id: "PO-2026-0048", supplier: "Metro Wholesale", branch: "Siddipet Main", items: "12", value: "₹42,100", delivery: "11 Jul", status: "Approved", owner: "Priya M." },
  { id: "PO-2026-0049", supplier: "Prime Proteins", branch: "Warangal", items: "1", value: "₹6,400", delivery: "12 Jul", status: "Awaiting Approval", owner: "Rahul K." },
];
