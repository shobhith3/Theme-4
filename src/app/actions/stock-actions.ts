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

  const notifications = await prisma.notification.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  const feedEvents = notifications.map(e => ({
    id: e.id,
    type: e.type,
    title: e.title,
    description: e.message,
    timestamp: e.createdAt.toISOString(),
    read: e.read,
    itemName: "", // Optional mapping if needed
    branchName: "" // Optional mapping if needed
  }));

  return { branches, suppliers, inventory, feedEvents };
}

export async function receiveStock(input: {
  itemId: string;
  branchId: string;
  supplierId: string;
  qty: number;
  reference?: string;
}) {
  const { user } = await validateUserAccess(input.branchId);
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
        type: 'receive_stock',
        referenceId: input.reference || `Manual Receipt from Supplier ${input.supplierId}`,
      }
    });

    await tx.branchInventory.update({
      where: { id: inventory.id },
      data: { currentStock: { increment: input.qty } }
    });

    await tx.stockIntakeRecord.create({
      data: {
        branchId: input.branchId,
        supplierId: input.supplierId,
        status: 'completed',
        type: 'receipt',
        expectedDate: new Date(),
        receivedDate: new Date(),
        createdBy: user.id
      }
    });

    await tx.activityLog.create({
      data: {
        organizationId: user.organizationId,
        branchId: input.branchId,
        userId: user.id,
        action: 'receive_stock',
        details: JSON.stringify({ itemId: input.itemId, qty: input.qty, supplierId: input.supplierId })
      }
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
          type: 'opening_stock',
          referenceId: 'Opening Stock',
        }
      });
    }

    await tx.activityLog.create({
      data: {
        organizationId: org.id,
        branchId: input.branchId,
        userId: user.id,
        action: 'add_opening_stock',
        details: JSON.stringify({ itemId: item.id, qty: input.qty, name: input.name })
      }
    });

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
  const { user } = await validateUserAccess(input.branchId);
  const prisma = await getPrisma();
  return prisma.$transaction(async (tx) => {
    const inventory = await tx.branchInventory.findUnique({
      where: { branchId_itemId: { branchId: input.branchId, itemId: input.itemId } },
    });
    if (!inventory) throw new Error("Inventory record not found.");

    const normalizedType = input.type.toLowerCase(); // wastage, expiry, damage, etc.

    await tx.stockTransaction.create({
      data: {
        inventoryId: inventory.id,
        itemId: input.itemId,
        quantity: input.qty,
        direction: -1,
        type: normalizedType,
        referenceId: input.reason || 'Manual Loss Record',
      }
    });

    await tx.branchInventory.update({
      where: { id: inventory.id },
      data: { currentStock: { decrement: input.qty } }
    });

    await tx.activityLog.create({
      data: {
        organizationId: user.organizationId,
        branchId: input.branchId,
        userId: user.id,
        action: 'record_loss',
        details: JSON.stringify({ itemId: input.itemId, qty: input.qty, type: normalizedType, reason: input.reason })
      }
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
  const { user } = await validateUserAccess(input.branchId);
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
        type: 'manual_adjustment',
        referenceId: input.reason || 'Physical audit correction',
      }
    });

    await tx.branchInventory.update({
      where: { id: inventory.id },
      data: { currentStock: input.newQty }
    });

    await tx.activityLog.create({
      data: {
        organizationId: user.organizationId,
        branchId: input.branchId,
        userId: user.id,
        action: 'adjust_stock',
        details: JSON.stringify({ itemId: input.itemId, oldQty: inventory.currentStock, newQty: input.newQty, reason: input.reason })
      }
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
  const { user } = await validateUserAccess(input.sourceId);
  await validateUserAccess(input.destId);
  
  const prisma = await getPrisma();
  return prisma.$transaction(async (tx) => {
    const sourceInventory = await tx.branchInventory.findUnique({
      where: { branchId_itemId: { branchId: input.sourceId, itemId: input.itemId } },
    });
    const destInventory = await tx.branchInventory.findUnique({
      where: { branchId_itemId: { branchId: input.destId, itemId: input.itemId } },
    });
    
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
        type: 'transfer_out',
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
        type: 'transfer_in',
        referenceId: transfer.id,
      }
    });
    await tx.branchInventory.update({
      where: { id: destInventory.id },
      data: { currentStock: { increment: input.qty } }
    });

    await tx.activityLog.create({
      data: {
        organizationId: user.organizationId,
        branchId: input.sourceId, // Primary log on source
        userId: user.id,
        action: 'transfer_stock',
        details: JSON.stringify({ transferId: transfer.id, itemId: input.itemId, qty: input.qty, sourceId: input.sourceId, destId: input.destId })
      }
    });

    revalidatePath('/inventory');
    revalidatePath('/stock-intake');
    return { success: true };
  }, { maxWait: 15000, timeout: 30000 });
}
