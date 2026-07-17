import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Helper for seeded random to make the script reproducible
let seed = 12345;

function random() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

function randomInt(min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number) {
  return random() * (max - min) + min;
}

async function main() {
  console.log('Starting seed...');

  // Clean up existing data
  await prisma.branchAccess.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.transferOrderItem.deleteMany();
  await prisma.transferOrder.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.stockTransaction.deleteMany();
  await prisma.branchInventory.deleteMany();
  await prisma.supplierItem.deleteMany();
  await prisma.item.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Create Organization
  const org = await prisma.organization.create({
    data: { name: 'FreshEats Co.' }
  });

  // Create Branches
  const hydCentral = await prisma.branch.create({
    data: { organizationId: org.id, name: 'Hyderabad Central', type: 'CENTRAL' }
  });
  const wglHub = await prisma.branch.create({
    data: { organizationId: org.id, name: 'Warangal Hub', type: 'HUB' }
  });
  const sidMain = await prisma.branch.create({
    data: { organizationId: org.id, name: 'Siddipet Main', type: 'MAIN' }
  });

  // Create Users & Branch Access
  const rohit = await prisma.user.create({
    data: { organizationId: org.id, name: 'Rohit', email: 'rohit@fresheats.co', role: 'REGIONAL_MANAGER' }
  });
  // Regional Manager gets access to all
  await prisma.branchAccess.createMany({
    data: [
      { userId: rohit.id, branchId: hydCentral.id },
      { userId: rohit.id, branchId: wglHub.id },
      { userId: rohit.id, branchId: sidMain.id },
    ]
  });

  const sanjay = await prisma.user.create({
    data: { organizationId: org.id, name: 'Sanjay', email: 'sanjay@fresheats.co', role: 'BRANCH_MANAGER' }
  });
  await prisma.branchAccess.create({ data: { userId: sanjay.id, branchId: hydCentral.id } });

  const kavya = await prisma.user.create({
    data: { organizationId: org.id, name: 'Kavya', email: 'kavya@fresheats.co', role: 'INVENTORY_STAFF' }
  });
  await prisma.branchAccess.create({ data: { userId: kavya.id, branchId: hydCentral.id } });

  const viewer = await prisma.user.create({
    data: { organizationId: org.id, name: 'Viewer User', email: 'viewer@fresheats.co', role: 'VIEWER' }
  });

  // Create Suppliers
  const freshRoute = await prisma.supplier.create({
    data: { organizationId: org.id, name: 'FreshRoute Foods', reliability: 95, leadTimeDays: 2 }
  });
  const deccanTraders = await prisma.supplier.create({
    data: { organizationId: org.id, name: 'Deccan Traders', reliability: 60, leadTimeDays: 5 } // Chronically late
  });

  // Create Items
  const chickenBreast = await prisma.item.create({
    data: {
      organizationId: org.id, sku: 'D-2048', name: 'Chicken Breast', category: 'Meat', unit: 'kg', unitRevenue: 1200
    }
  });
  const paneer = await prisma.item.create({
    data: {
      organizationId: org.id, sku: 'D-1024', name: 'Paneer', category: 'Dairy', unit: 'kg', unitRevenue: 800
    }
  });
  const tomatoes = await prisma.item.create({
    data: {
      organizationId: org.id, sku: 'V-512', name: 'Tomatoes', category: 'Vegetables', unit: 'kg', unitRevenue: 150
    }
  });
  const newSpice = await prisma.item.create({ // Near-zero-history
    data: {
      organizationId: org.id, sku: 'S-128', name: 'Exotic Saffron', category: 'Spices', unit: 'g', unitRevenue: 5000
    }
  });

  // Create SupplierItems
  await prisma.supplierItem.createMany({
    data: [
      { supplierId: freshRoute.id, itemId: chickenBreast.id, unitCost: 200, minOrderQty: 10 },
      { supplierId: deccanTraders.id, itemId: chickenBreast.id, unitCost: 190, minOrderQty: 20 },
      { supplierId: freshRoute.id, itemId: paneer.id, unitCost: 250, minOrderQty: 5 },
      { supplierId: freshRoute.id, itemId: tomatoes.id, unitCost: 40, minOrderQty: 50 },
      { supplierId: freshRoute.id, itemId: newSpice.id, unitCost: 4000, minOrderQty: 1 },
    ]
  });

  // Setup Inventory & generate transactions
  const branches = [hydCentral, wglHub, sidMain];
  const items = [chickenBreast, paneer, tomatoes, newSpice];

  const today = new Date('2025-05-21T00:00:00.000Z'); // Fixed anchor date

  for (const branch of branches) {
    for (const item of items) {

      // Determine characteristics
      let isHeroCase = (item.id === chickenBreast.id && branch.id === hydCentral.id);
      let isOverstockedDonor = (branch.id === wglHub.id && item.id === chickenBreast.id);
      let isNearZero = (item.id === newSpice.id);
      let isVolatile = (item.id === paneer.id || item.id === tomatoes.id);

      let safeStock = 15;
      let targetCurrentStock = randomInt(20, 50);
      let baseDemand = 10;

      if (isHeroCase) {
        safeStock = 15;
        targetCurrentStock = 8;
        baseDemand = 12; // so 8kg is ~0.7 days cover
      }
      if (isOverstockedDonor) {
        targetCurrentStock = 100;
        safeStock = 20;
      }
      if (isNearZero) {
        baseDemand = 2;
        safeStock = 5;
        targetCurrentStock = 6;
      }

      // Create BranchInventory
      const inventory = await prisma.branchInventory.create({
        data: {
          branchId: branch.id,
          itemId: item.id,
          currentStock: targetCurrentStock,
          safeStock: safeStock,
          safeCoverDays: 3,
        }
      });

      // Generate Ledger Transactions
      let currentRunningStock = 0;
      const historyDays = isNearZero ? 3 : 90;

      // We will first inject an initial intake 90 days ago, then daily consumption and weekly intakes.
      // At the end, we do an adjustment to land exactly at `targetCurrentStock`.

      const transactions = [];

      // Initial Intake
      const initialDate = new Date(today);
      initialDate.setDate(today.getDate() - historyDays);

      transactions.push({
        inventoryId: inventory.id,
        itemId: item.id,
        quantity: 500,
        direction: 1,
        type: 'INTAKE',
        date: initialDate
      });
      currentRunningStock += 500;

      for (let i = historyDays - 1; i >= 1; i--) {
        let currentDate = new Date(today);
        currentDate.setDate(today.getDate() - i);

        let dailyDemand = baseDemand;

        // Texture: Weekend patterns
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          dailyDemand *= 1.4; // 40% higher on weekends
        }

        // Texture: Volatility
        if (isVolatile) {
          dailyDemand *= randomFloat(0.5, 1.5);
        }

        // Texture: Festival Spike (e.g. 15 days ago)
        if (i === 15) {
          dailyDemand *= 2.5;
        }

        dailyDemand = Math.round(dailyDemand);

        if (dailyDemand > 0) {
          transactions.push({
            inventoryId: inventory.id,
            itemId: item.id,
            quantity: dailyDemand,
            direction: -1,
            type: 'CONSUMPTION',
            date: currentDate
          });
          currentRunningStock -= dailyDemand;
        }

        // Replenish occasionally if running low, to keep numbers realistic, except for the last few days of hero case
        if (currentRunningStock < safeStock && !isHeroCase && !isOverstockedDonor && i > 5) {
          const intake = Math.round(baseDemand * 10);
          transactions.push({
            inventoryId: inventory.id,
            itemId: item.id,
            quantity: intake,
            direction: 1,
            type: 'INTAKE',
            date: currentDate
          });
          currentRunningStock += intake;
        }
      }

      // Force the final stock to match `targetCurrentStock` precisely for hero case and others
      const difference = targetCurrentStock - currentRunningStock;
      if (difference !== 0) {
        transactions.push({
          inventoryId: inventory.id,
          itemId: item.id,
          quantity: Math.abs(difference),
          direction: difference > 0 ? 1 : -1,
          type: 'ADJUSTMENT',
          date: today
        });
      }

      await prisma.stockTransaction.createMany({
        data: transactions
      });
    }
  }

  // Double check the hero case ledger sum
  const heroTx = await prisma.stockTransaction.aggregate({
    where: {
      item: { sku: 'D-2048' },
      inventory: { branch: { name: 'Hyderabad Central' } }
    },
    _sum: {
      quantity: true
    },
  });

  // Since we don't have a computed field for direction multiplication in Prisma aggregate easily, 
  // we do raw query to verify.
  const rawSum: any = await prisma.$queryRaw`
    SELECT SUM(quantity * direction) as total
    FROM "StockTransaction" st
    JOIN "Item" i ON st."itemId" = i.id
    JOIN "BranchInventory" bi ON st."inventoryId" = bi.id
    JOIN "Branch" b ON bi."branchId" = b.id
    WHERE i.sku = 'D-2048' AND b.name = 'Hyderabad Central'
  `;

  console.log(`Hero Case (Chicken Breast @ Hyd Central) Verified Stock: ${rawSum[0].total} kg (Expected: 8 kg)`);

  console.log('Seed completed successfully.');
  console.log(`Inserted 1 Organization, 3 Branches, 2 Suppliers, 4 Items, and ~${90 * 3 * 4} ledger transactions.`);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
