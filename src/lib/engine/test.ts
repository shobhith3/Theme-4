import { PrismaClient } from '@prisma/client';
import { computeDecision } from './index';
import { EngineInput, DailyConsumption, SupplierOption, TransferOption, HybridOption } from './types';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL missing");
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("Fetching Hero Case (D-2048 at Hyderabad Central)...");
  
  const hydCentral = await prisma.branch.findFirst({ where: { name: 'Hyderabad Central' }});
  const heroItem = await prisma.item.findFirst({ where: { sku: 'D-2048' }});
  
  if (!hydCentral || !heroItem) throw new Error("Missing seeded data");

  const inventory = await prisma.branchInventory.findUnique({
    where: { branchId_itemId: { branchId: hydCentral.id, itemId: heroItem.id } },
    include: { transactions: true }
  });
  
  if (!inventory) throw new Error("Missing inventory");
  
  // Actually currentStock cached vs ledger computed
  const ledgerSum: any = await prisma.$queryRaw`
    SELECT SUM(quantity * direction) as total
    FROM "StockTransaction"
    WHERE "inventoryId" = ${inventory.id}
  `;
  const currentStock = Number(ledgerSum[0].total) || inventory.currentStock;
  
  const history: DailyConsumption[] = inventory.transactions
    .filter(t => t.type === 'CONSUMPTION')
    .map(t => ({
      date: t.date,
      quantity: t.quantity
    }));
    
  // Find Suppliers for D-2048
  const supplierItems = await prisma.supplierItem.findMany({
    where: { itemId: heroItem.id },
    include: { supplier: true }
  });
  
  const purchaseOptions: SupplierOption[] = supplierItems.map(si => ({
    type: 'PURCHASE',
    supplierId: si.supplierId,
    name: si.supplier.name,
    reliability: si.supplier.reliability,
    leadTimeDays: si.supplier.leadTimeDays,
    unitCost: si.unitCost,
    minOrderQty: si.minOrderQty
  }));
  
  // Find Donor branch (Warangal Hub)
  const warangalHub = await prisma.branch.findFirst({ where: { name: 'Warangal Hub' }});
  let transferOptions: TransferOption[] = [];
  if (warangalHub) {
    const donorInv = await prisma.branchInventory.findUnique({
      where: { branchId_itemId: { branchId: warangalHub.id, itemId: heroItem.id } }
    });
    
    // Ledger sum for donor
    const donorSum: any = await prisma.$queryRaw`
      SELECT SUM(quantity * direction) as total
      FROM "StockTransaction"
      WHERE "inventoryId" = ${donorInv?.id}
    `;
    const donorStock = donorSum[0] ? Number(donorSum[0].total) : donorInv?.currentStock || 0;
    
    if (donorInv) {
      transferOptions.push({
        type: 'TRANSFER',
        donorBranchId: warangalHub.id,
        name: warangalHub.name,
        donorCurrentStock: donorStock,
        donorSafeStock: donorInv.safeStock,
        travelTimeDays: 1, // Assume 1 day travel
        coldChainAvailable: true
      });
    }
  }
  
  const input: EngineInput = {
    itemSku: heroItem.sku,
    itemName: heroItem.name,
    branchName: hydCentral.name,
    category: heroItem.category,
    
    history,
    
    currentStock,
    reservedStock: inventory.reservedStock,
    expiredOrDamaged: 0,
    confirmedIncoming: 0,
    
    safeStock: inventory.safeStock,
    safeCoverDays: inventory.safeCoverDays,
    leadTime: 2, // Standardizing primary lead time
    
    unitRevenue: heroItem.unitRevenue,
    riskWindowDays: 7,
    
    currentDate: new Date('2025-05-21T00:00:00.000Z'), // Match seed end date
    
    purchaseOptions,
    transferOptions
  };
  
  const output = computeDecision(input);
  
  console.log("=========================================");
  console.log("ENGINE OUTPUT FOR D-2048 (HERO CASE)");
  console.log("=========================================");
  console.log(`Forecast: expectedDailyDemand=${output.forecast.expectedDailyDemand.toFixed(2)} (Base=${output.forecast.baseDemand.toFixed(2)}, DoW=${output.forecast.dowFactor.toFixed(2)}, Trend=${output.forecast.trendFactor.toFixed(2)})`);
  console.log(`Confidence: ${output.confidence}%`);
  console.log(`Metrics: usableStock=${output.metrics.usableStock}, safeStock=${input.safeStock}`);
  console.log(`Cover: ${output.metrics.stockCover.toFixed(2)} days (Breach in ${output.metrics.timeToBreach.toFixed(2)} days)`);
  console.log(`Risk Level: ${output.riskLevel}`);
  console.log(`\nOptions Scored (${output.scoredOptions.length}):`);
  
  output.scoredOptions.forEach((o, i) => {
    console.log(`\n#${i+1} [${o.option.type}] ${o.option.type === 'TRANSFER' ? (o.option as TransferOption).name : o.option.type === 'PURCHASE' ? (o.option as SupplierOption).name : 'Hybrid'} - Score: ${o.totalScore.toFixed(0)}`);
    if (!o.feasible) console.log(`   (Blocked: ${o.blockingReason})`);
    console.log(`   Recommended Qty: ${o.recommendedQuantity}`);
    console.log(`   Breakdown: Urgency=${o.breakdown.urgencyFit}, RiskRed=${o.breakdown.riskReduction}, RevProt=${o.breakdown.revenueProtection}, Rel=${o.breakdown.supplierReliability}, CostEff=${o.breakdown.costEfficiency}`);
  });
  
  console.log("\n=========================================");
  if (output.chosenOption?.option.type === 'HYBRID') {
    const ho = output.chosenOption.option as HybridOption;
    console.log(`Chosen Option: HYBRID -> Transfer ${ho.transferQuantity} from ${ho.transferOption.name} AND Purchase ${ho.purchaseQuantity} from ${ho.purchaseOption.name}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
