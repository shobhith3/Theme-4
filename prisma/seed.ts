import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

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
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.outcomeRecord.deleteMany();
  await prisma.fileRecord.deleteMany();
  await prisma.autoApprovalRule.deleteMany();
  await prisma.stockIntakeRecord.deleteMany();
  await prisma.auditRecord.deleteMany();
  await prisma.forecastInputSnapshot.deleteMany();
  await prisma.forecastRun.deleteMany();
  await prisma.forecast.deleteMany();
  
  await prisma.organizationMember.deleteMany();
  await prisma.role.deleteMany();

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

  // Create Roles
  const ownerRole = await prisma.role.create({
    data: { organizationId: org.id, name: 'OWNER', permissions: 'ALL' }
  });
  const regionalRole = await prisma.role.create({
    data: { organizationId: org.id, name: 'REGIONAL_MANAGER', permissions: 'ALL' }
  });
  const branchRole = await prisma.role.create({
    data: { organizationId: org.id, name: 'BRANCH_MANAGER', permissions: 'BRANCH_SPECIFIC' }
  });
  const inventoryRole = await prisma.role.create({
    data: { organizationId: org.id, name: 'INVENTORY_STAFF', permissions: 'INVENTORY_ONLY' }
  });
  const viewerRole = await prisma.role.create({
    data: { organizationId: org.id, name: 'VIEWER', permissions: 'READ_ONLY' }
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

  // Create Users & Organization Members & Branch Access
  const rohit = await prisma.user.create({
    data: { organizationId: org.id, name: 'Rohit', email: 'rohit@procureiq.demo', role: 'REGIONAL_MANAGER' }
  });
  await prisma.organizationMember.create({
    data: { organizationId: org.id, userId: rohit.id, roleId: regionalRole.id }
  });
  await prisma.branchAccess.createMany({
    data: [
      { userId: rohit.id, branchId: hydCentral.id },
      { userId: rohit.id, branchId: wglHub.id },
      { userId: rohit.id, branchId: sidMain.id },
    ]
  });

  const sanjay = await prisma.user.create({
    data: { organizationId: org.id, name: 'Sanjay', email: 'sanjay@procureiq.demo', role: 'BRANCH_MANAGER' }
  });
  await prisma.organizationMember.create({
    data: { organizationId: org.id, userId: sanjay.id, roleId: branchRole.id }
  });
  await prisma.branchAccess.create({ data: { userId: sanjay.id, branchId: hydCentral.id } });

  const kavya = await prisma.user.create({
    data: { organizationId: org.id, name: 'Kavya', email: 'kavya@procureiq.demo', role: 'INVENTORY_STAFF' }
  });
  await prisma.organizationMember.create({
    data: { organizationId: org.id, userId: kavya.id, roleId: inventoryRole.id }
  });
  await prisma.branchAccess.create({ data: { userId: kavya.id, branchId: hydCentral.id } });

  const viewer = await prisma.user.create({
    data: { organizationId: org.id, name: 'Viewer User', email: 'viewer@procureiq.demo', role: 'VIEWER' }
  });
  await prisma.organizationMember.create({
    data: { organizationId: org.id, userId: viewer.id, roleId: viewerRole.id }
  });

  // Create Suppliers
  const freshRoute = await prisma.supplier.create({
    data: { organizationId: org.id, name: 'FreshRoute Foods', reliability: 98, leadTimeDays: 1 }
  });
  const deccanTraders = await prisma.supplier.create({
    data: { organizationId: org.id, name: 'Deccan Traders', reliability: 60, leadTimeDays: 5 } // Chronically late
  });
  const telanganaFresh = await prisma.supplier.create({
    data: { organizationId: org.id, name: 'Telangana Fresh Farms', reliability: 85, leadTimeDays: 4 }
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
      { supplierId: freshRoute.id, itemId: chickenBreast.id, unitCost: 195, minOrderQty: 10 },
      { supplierId: telanganaFresh.id, itemId: chickenBreast.id, unitCost: 210, minOrderQty: 10 },
      { supplierId: deccanTraders.id, itemId: chickenBreast.id, unitCost: 190, minOrderQty: 20 },
      { supplierId: freshRoute.id, itemId: paneer.id, unitCost: 250, minOrderQty: 5 },
      { supplierId: freshRoute.id, itemId: tomatoes.id, unitCost: 40, minOrderQty: 50 },
      { supplierId: freshRoute.id, itemId: newSpice.id, unitCost: 4000, minOrderQty: 1 },
    ]
  });

  // Setup Inventory & generate transactions
  const branches = [hydCentral, wglHub, sidMain];
  const items = [chickenBreast, paneer, tomatoes, newSpice];

  const today = new Date('2025-05-21T00:00:00.000Z');

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

      const inventory = await prisma.branchInventory.create({
        data: {
          branchId: branch.id,
          itemId: item.id,
          currentStock: targetCurrentStock,
          safeStock: safeStock,
          safeCoverDays: 3,
        }
      });

      let currentRunningStock = 0;
      const historyDays = isNearZero ? 3 : 90;
      const transactions = [];

      const initialDate = new Date(today);
      initialDate.setDate(today.getDate() - historyDays);

      transactions.push({
        inventoryId: inventory.id,
        itemId: item.id,
        quantity: 500,
        direction: 1,
        type: 'opening_stock',
        date: initialDate
      });
      currentRunningStock += 500;

      for (let i = historyDays - 1; i >= 1; i--) {
        let currentDate = new Date(today);
        currentDate.setDate(today.getDate() - i);

        let dailyDemand = baseDemand;
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          dailyDemand *= 1.4;
        }

        if (isVolatile) {
          dailyDemand *= randomFloat(0.5, 1.5);
        }

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
            type: 'sales_consumption',
            date: currentDate
          });
          currentRunningStock -= dailyDemand;
        }

        if (currentRunningStock < safeStock && !isHeroCase && !isOverstockedDonor && i > 5) {
          const intake = Math.round(baseDemand * 10);
          transactions.push({
            inventoryId: inventory.id,
            itemId: item.id,
            quantity: intake,
            direction: 1,
            type: 'receive_stock',
            date: currentDate
          });
          currentRunningStock += intake;
        }
      }

      const difference = targetCurrentStock - currentRunningStock;
      if (difference !== 0) {
        transactions.push({
          inventoryId: inventory.id,
          itemId: item.id,
          quantity: Math.abs(difference),
          direction: difference > 0 ? 1 : -1,
          type: 'manual_adjustment',
          date: today
        });
      }

      await prisma.stockTransaction.createMany({
        data: transactions
      });
    }
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
