export interface ForecastPoint {
  date: string;
  predictedDemand: number;
  actualDemand?: number;
  confidenceLower: number;
  confidenceUpper: number;
}

export interface ItemForecast {
  id: string;
  itemId: string;
  itemName: string;
  branchId: string;
  branchName: string;
  generatedAt: string;
  forecastHorizonDays: number;
  dataPoints: ForecastPoint[];
  trend: "increasing" | "stable" | "decreasing";
  seasonalFactors: string[];
  confidenceScore: number;
  daysUntilStockout: number | null;
  predictedStockoutDate: string | null;
}
