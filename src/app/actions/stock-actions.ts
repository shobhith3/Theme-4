'use server';

import { getPrisma } from './engine-actions';
import { revalidatePath } from 'next/cache';
import { validateUserAccess } from '@/lib/auth-utils';

export async function getRealData() {
  const prisma = await getPrisma();
  
  // Only return data for the user's organization
  const { user } = await validateUserAccess();
  const orgId = user.organizationId;

  const branches = await prisma.branch.findMany({ 
    where: { organizationId: orgId },
    select: { id: true, name: true } 
  });
  
  const suppliers = await prisma.supplier.findMany({ 
    where: { organizationId: orgId },
    select: { id: true, name: true } 
  });
  
  const inventoryRecords = await prisma.branchInventory.findMany({
    where: { branch: { organizationId: orgId } },
    include: { item: true, branch: true }
  });

  const inventory = inventoryRecords.map(inv => ({
    id: inv.item.id,
    name: inv.item.name,
    branchId: inv.branchId,
    branchName: inv.branch.name,
    currentStock: inv.currentStock,
    minStock: inv.safeStock,
    maxStock: inv.safeStock * 3,
    unit: inv.item.unit,
  }));

  return { branches, suppliers, inventory };
}

export async function receiveStock(input: {
  itemId: string;
  branchId: string;
  supplierId: string;
  qty: number;
  reference?: string;
}) {
  await validateUserAccess(input.branchId);
  const prisma = await getPrisma();
  return prisma.$transaction(async (tx) => {
    const inventory = await tx.branchInventory.findUnique({
      where: { branchId_itemId: { branchId: input.branchId, itemId: input.itemId } },
    });
    if (!inventory) throw new Error("Inventory record not found.");

    await tx.stockTransaction.create({
      data: {
        inventoryId: inventory.id,
        itemId: input.itemId,
        quantity: input.qty,
        direction: 1,
        type: 'INTAKE',
        referenceId: input.reference || `Manual Receipt from Supplier ${input.supplierId}`,
      }
    });

    await tx.branchInventory.update({
      where: { id: inventory.id },
      data: { currentStock: { increment: input.qty } }
    });

    revalidatePath('/inventory');
    revalidatePath('/stock-intake');
    return { success: true };
  }, { maxWait: 15000, timeout: 30000 });
}

export async function addOpeningStock(input: {
  name: string;
  branchId: string;
  qty: number;
}) {
  const { user } = await validateUserAccess(input.branchId);
  const prisma = await getPrisma();
  return prisma.$transaction(async (tx) => {
    const org = await tx.organization.findUnique({ where: { id: user.organizationId } });
    if (!org) throw new Error("No organization found.");
    
    const sku = `SKU-${Date.now().toString().slice(-6)}`;
    
    // Create Item
    const item = await tx.item.create({
      data: {
        organizationId: org.id,
        sku,
        name: input.name,
        category: 'general',
        unit: 'units',
        unitRevenue: 0,
      }
    });

    // Create BranchInventory
    const inventory = await tx.branchInventory.create({
      data: {
        branchId: input.branchId,
        itemId: item.id,
        currentStock: input.qty,
        safeStock: 10,
        safeCoverDays: 7,
      }
    });

    if (input.qty > 0) {
      // Create transaction
      await tx.stockTransaction.create({
        data: {
          inventoryId: inventory.id,
          itemId: item.id,
          quantity: input.qty,
          direction: 1,
          type: 'INTAKE',
          referenceId: 'Opening Stock',
        }
      });
    }

    revalidatePath('/inventory');
    revalidatePath('/stock-intake');
    return { success: true, itemId: item.id };
  }, { maxWait: 15000, timeout: 30000 });
}

export async function recordLoss(input: {
  itemId: string;
  branchId: string;
  qty: number;
  type: string;
  reason?: string;
}) {
  await validateUserAccess(input.branchId);
  const prisma = await getPrisma();
  return prisma.$transaction(async (tx) => {
    const inventory = await tx.branchInventory.findUnique({
      where: { branchId_itemId: { branchId: input.branchId, itemId: input.itemId } },
    });
    if (!inventory) throw new Error("Inventory record not found.");

    await tx.stockTransaction.create({
      data: {
        inventoryId: inventory.id,
        itemId: input.itemId,
        quantity: input.qty,
        direction: -1,
        type: input.type.toUpperCase(), // e.g. WASTAGE, DAMAGE, EXPIRY
        referenceId: input.reason || 'Manual Loss Record',
      }
    });

    await tx.branchInventory.update({
      where: { id: inventory.id },
      data: { currentStock: { decrement: input.qty } }
    });

    revalidatePath('/inventory');
    revalidatePath('/stock-intake');
    return { success: true };
  }, { maxWait: 15000, timeout: 30000 });
}

export async function adjustStock(input: {
  itemId: string;
  branchId: string;
  newQty: number;
  reason?: string;
}) {
  await validateUserAccess(input.branchId);
  const prisma = await getPrisma();
  return prisma.$transaction(async (tx) => {
    const inventory = await tx.branchInventory.findUnique({
      where: { branchId_itemId: { branchId: input.branchId, itemId: input.itemId } },
    });
    if (!inventory) throw new Error("Inventory record not found.");

    const diff = input.newQty - inventory.currentStock;
    if (diff === 0) return { success: true };

    await tx.stockTransaction.create({
      data: {
        inventoryId: inventory.id,
        itemId: input.itemId,
        quantity: Math.abs(diff),
        direction: diff > 0 ? 1 : -1,
        type: 'ADJUSTMENT',
        referenceId: input.reason || 'Physical audit correction',
      }
    });

    await tx.branchInventory.update({
      where: { id: inventory.id },
      data: { currentStock: input.newQty }
    });

    revalidatePath('/inventory');
    revalidatePath('/stock-intake');
    return { success: true };
  }, { maxWait: 15000, timeout: 30000 });
}

export async function transferStock(input: {
  itemId: string;
  sourceId: string;
  destId: string;
  qty: number;
}) {
  await validateUserAccess(input.sourceId);
  await validateUserAccess(input.destId);
  
  const prisma = await getPrisma();
  return prisma.$transaction(async (tx) => {
    const sourceInventory = await tx.branchInventory.findUnique({
      where: { branchId_itemId: { branchId: input.sourceId, itemId: input.itemId } },
    });
    const destInventory = await tx.branchInventory.findUnique({
      where: { branchId_itemId: { branchId: input.destId, itemId: input.itemId } },
    });
    
    // Just find the organization from the source branch
    const sourceBranch = await tx.branch.findUnique({ where: { id: input.sourceId }});
    const organizationId = sourceBranch?.organizationId;
    if (!organizationId) throw new Error("Organization not found for branch.");

    if (!sourceInventory || !destInventory) throw new Error("Source or destination inventory not found.");

    // Create Transfer Order record
    const transfer = await tx.transferOrder.create({
      data: {
        sourceBranchId: input.sourceId,
        destBranchId: input.destId,
        status: 'Received', // Instant manual transfer
        items: {
          create: {
            itemId: input.itemId,
            quantity: input.qty
          }
        }
      }
    });

    // Source transaction
    await tx.stockTransaction.create({
      data: {
        inventoryId: sourceInventory.id,
        itemId: input.itemId,
        quantity: input.qty,
        direction: -1,
        type: 'TRANSFER_OUT',
        referenceId: transfer.id,
      }
    });
    await tx.branchInventory.update({
      where: { id: sourceInventory.id },
      data: { currentStock: { decrement: input.qty } }
    });

    // Dest transaction
    await tx.stockTransaction.create({
      data: {
        inventoryId: destInventory.id,
        itemId: input.itemId,
        quantity: input.qty,
        direction: 1,
        type: 'TRANSFER_IN',
        referenceId: transfer.id,
      }
    });
    await tx.branchInventory.update({
      where: { id: destInventory.id },
      data: { currentStock: { increment: input.qty } }
    });

    revalidatePath('/inventory');
    revalidatePath('/stock-intake');
    return { success: true };
  }, { maxWait: 15000, timeout: 30000 });
}
