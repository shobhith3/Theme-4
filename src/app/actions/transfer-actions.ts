'use server';

import prisma from '@/lib/prisma';
import { validateUserAccess } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function getTransfers() {
  const { user, role } = await validateUserAccess();
  
  const branchIds = user.branchAccess.map(ba => ba.branchId);

  const transfers = await prisma.transferOrder.findMany({
    where: {
      OR: [
        { sourceBranch: { organizationId: user.organizationId } },
        { destBranch: { organizationId: user.organizationId } }
      ],
      ...((role === 'OWNER' || role === 'ADMIN' || role === 'REGIONAL_MANAGER') ? {} : {
        OR: [
          { sourceBranchId: { in: branchIds } },
          { destBranchId: { in: branchIds } }
        ]
      })
    },
    include: {
      sourceBranch: true,
      destBranch: true,
      items: {
        include: { item: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return transfers.map(t => {
    const item = t.items[0]; // Assuming 1 item per transfer for UI simplicity based on schema/mock
    return {
      id: t.id,
      sourceBranchId: t.sourceBranchId,
      sourceBranchName: t.sourceBranch.name,
      destinationBranchId: t.destBranchId,
      destinationBranchName: t.destBranch.name,
      itemId: item.itemId,
      itemName: item.item.name,
      quantity: item.quantity,
      unit: item.item.unit,
      status: t.status.toLowerCase(), // 'draft', 'approved', 'dispatched', 'in transit', 'received'
      expectedArrivalDate: t.expectedArrival?.toISOString() || t.createdAt.toISOString(),
      createdAt: t.createdAt.toISOString(),
    };
  });
}

export async function dispatchTransfer(transferId: string) {
  const { user } = await validateUserAccess();
  
  return await prisma.$transaction(async (tx) => {
    const transfer = await tx.transferOrder.findUnique({
      where: { id: transferId },
      include: { items: true }
    });

    if (!transfer) throw new Error("Transfer not found");
    if (transfer.status.toLowerCase() !== 'draft' && transfer.status.toLowerCase() !== 'approved') {
      throw new Error("Transfer is not in a dispatchable state");
    }

    // 1. Update Status
    await tx.transferOrder.update({
      where: { id: transferId },
      data: { status: 'Dispatched' }
    });

    // 2. We already reduced currentStock when transferStock was initiated instantly in `stock-actions.ts`, 
    // OR if this was a drafted transfer, we should reduce currentStock now.
    // For Phase 2, `execution-actions.ts` created the transfer in 'Draft' and only increased reservedStock in donor.
    // So here, on Dispatch: decrease currentStock, decrease reservedStock in donor.
    
    for (const item of transfer.items) {
      const donorInventory = await tx.branchInventory.findUnique({
        where: { branchId_itemId: { branchId: transfer.sourceBranchId, itemId: item.itemId } }
      });
      
      if (donorInventory) {
        await tx.stockTransaction.create({
          data: {
            inventoryId: donorInventory.id,
            itemId: item.itemId,
            quantity: item.quantity,
            direction: -1,
            type: 'transfer_out',
            referenceId: transferId,
          }
        });

        await tx.branchInventory.update({
          where: { id: donorInventory.id },
          data: { 
            currentStock: { decrement: item.quantity },
            reservedStock: { decrement: item.quantity } // Removing reservation
          }
        });
      }
    }

    await tx.activityLog.create({
      data: {
        organizationId: user.organizationId,
        branchId: transfer.sourceBranchId,
        userId: user.id,
        action: 'dispatch_transfer',
        details: JSON.stringify({ transferId })
      }
    });
    
    revalidatePath('/transfers');
    revalidatePath('/inventory');
    return { success: true };
  });
}

export async function receiveTransfer(transferId: string) {
  const { user } = await validateUserAccess();
  
  return await prisma.$transaction(async (tx) => {
    const transfer = await tx.transferOrder.findUnique({
      where: { id: transferId },
      include: { items: true }
    });

    if (!transfer) throw new Error("Transfer not found");
    if (transfer.status.toLowerCase() === 'received') {
      throw new Error("Transfer is already received");
    }

    // 1. Update Status
    await tx.transferOrder.update({
      where: { id: transferId },
      data: { status: 'Received' }
    });

    // 2. Increase stock in destination
    for (const item of transfer.items) {
      let destInventory = await tx.branchInventory.findUnique({
        where: { branchId_itemId: { branchId: transfer.destBranchId, itemId: item.itemId } }
      });
      
      if (!destInventory) {
        destInventory = await tx.branchInventory.create({
          data: {
            branchId: transfer.destBranchId,
            itemId: item.itemId,
            currentStock: 0,
            safeStock: 0,
            safeCoverDays: 0,
          }
        });
      }

      await tx.stockTransaction.create({
        data: {
          inventoryId: destInventory.id,
          itemId: item.itemId,
          quantity: item.quantity,
          direction: 1,
          type: 'transfer_in',
          referenceId: transferId,
        }
      });

      await tx.branchInventory.update({
        where: { id: destInventory.id },
        data: { currentStock: { increment: item.quantity } }
      });
    }

    await tx.activityLog.create({
      data: {
        organizationId: user.organizationId,
        branchId: transfer.destBranchId,
        userId: user.id,
        action: 'receive_transfer',
        details: JSON.stringify({ transferId })
      }
    });
    
    revalidatePath('/transfers');
    revalidatePath('/inventory');
    return { success: true };
  });
}
