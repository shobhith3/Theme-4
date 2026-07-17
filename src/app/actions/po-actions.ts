'use server';

import prisma from '@/lib/prisma';
import { validateUserAccess } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function getPurchaseOrders() {
  const { user } = await validateUserAccess();

  const pos = await prisma.purchaseOrder.findMany({
    where: {
      supplier: {
        organizationId: user.organizationId
      }
    },
    include: {
      supplier: true,
      items: {
        include: {
          item: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return pos.map(po => ({
    id: po.id,
    poNumber: `PO-${po.id.slice(-6).toUpperCase()}`,
    supplierName: po.supplier.name,
    branchName: 'Main Hub', // We might need to map branch if POs are assigned to specific branches
    status: po.status.toLowerCase(), // 'draft', 'confirmed', 'received', 'sent'
    expectedDeliveryDate: po.expectedDate?.toISOString() || po.createdAt.toISOString(),
    totalAmount: po.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0),
    lineItems: po.items.map(i => ({
      itemId: i.itemId,
      itemName: i.item.name,
      quantity: i.quantity,
      unit: i.item.unit,
      unitPrice: i.unitCost,
      totalPrice: i.quantity * i.unitCost
    }))
  }));
}

export async function receivePurchaseOrder(poId: string, branchId: string) {
  const { user } = await validateUserAccess(branchId);
  
  return await prisma.$transaction(async (tx) => {
    const po = await tx.purchaseOrder.findUnique({
      where: { id: poId },
      include: { items: true }
    });

    if (!po) throw new Error("PO not found");
    if (po.status.toLowerCase() === 'received' || po.status.toLowerCase() === 'fulfilled') {
      throw new Error("PO already received");
    }

    // 1. Update PO Status
    await tx.purchaseOrder.update({
      where: { id: poId },
      data: { status: 'Received' }
    });

    // 2. Add Stock and Create StockTransaction & ActivityLog
    for (const item of po.items) {
      let inventory = await tx.branchInventory.findUnique({
        where: { branchId_itemId: { branchId: branchId, itemId: item.itemId } }
      });
      
      if (!inventory) {
        inventory = await tx.branchInventory.create({
          data: {
            branchId: branchId,
            itemId: item.itemId,
            currentStock: 0,
            safeStock: 0,
            safeCoverDays: 0,
          }
        });
      }

      await tx.stockTransaction.create({
        data: {
          inventoryId: inventory.id,
          itemId: item.itemId,
          quantity: item.quantity,
          direction: 1,
          type: 'po_receipt',
          referenceId: poId,
        }
      });

      await tx.branchInventory.update({
        where: { id: inventory.id },
        data: { currentStock: { increment: item.quantity } }
      });
    }

    await tx.activityLog.create({
      data: {
        organizationId: user.organizationId,
        branchId: branchId,
        userId: user.id,
        action: 'receive_po',
        details: JSON.stringify({ poId, itemsReceived: po.items.length })
      }
    });
    
    // Log Intake
    await tx.stockIntakeRecord.create({
      data: {
        branchId: branchId,
        supplierId: po.supplierId,
        status: 'completed',
        type: 'po_receipt',
        expectedDate: po.expectedDate,
        receivedDate: new Date(),
        createdBy: user.id
      }
    });
    
    revalidatePath('/purchase-orders');
    revalidatePath('/inventory');
    return { success: true };
  });
}
