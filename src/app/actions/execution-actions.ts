'use server';

import { getPrisma } from './engine-actions';
import { validateUserAccess } from '@/lib/auth-utils';

interface ExecuteDecisionInput {
  itemSku: string;
  destBranchName: string;
  strategy: 'procure' | 'transfer' | 'hybrid';
  purchaseQty: number;
  transferQty: number;
  supplierId?: string;
  sourceBranchId?: string;
  decisionId?: string;
}

export async function executeDecision(input: ExecuteDecisionInput) {
  const prisma = await getPrisma();
  
  // Look up the dest branch
  const destBranch = await prisma.branch.findFirst({ where: { name: input.destBranchName }});
  if (!destBranch) throw new Error(`Cannot find branch ${input.destBranchName}`);
  
  // Validate authorization for destination branch
  await validateUserAccess(destBranch.id);

  // Validate authorization for source branch if transferring
  if (input.sourceBranchId) {
    await validateUserAccess(input.sourceBranchId);
  }
  
  // We perform everything in a single transaction
  return await prisma.$transaction(async (tx) => {
    const item = await tx.item.findFirst({ where: { sku: input.itemSku }});
    
    if (!item) {
      throw new Error(`Cannot find item ${input.itemSku}`);
    }
    
    const itemId = item.id;
    const destBranchId = destBranch.id;

    // 0. Idempotency Check
    if (input.decisionId) {
      const decision = await tx.decision.findUnique({ where: { id: input.decisionId } });
      if (decision?.status === 'approved') {
        throw new Error("This decision has already been executed.");
      }
    }

    // 1. Create Purchase Order if needed
    let poId = null;
    if ((input.strategy === 'procure' || input.strategy === 'hybrid') && input.purchaseQty > 0) {
      if (!input.supplierId) throw new Error("Supplier ID required for purchase");
      
      const supplierItem = await tx.supplierItem.findUnique({
        where: { supplierId_itemId: { supplierId: input.supplierId, itemId: itemId } }
      });
      
      const po = await tx.purchaseOrder.create({
        data: {
          supplierId: input.supplierId,
          status: 'Confirmed',
          expectedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // e.g. 2 days
          items: {
            create: {
              itemId: itemId,
              quantity: input.purchaseQty,
              unitCost: supplierItem?.unitCost || 0
            }
          }
        }
      });
      poId = po.id;
    }

    // 2. Create Transfer Order if needed (with Reservation)
    let transferId = null;
    if ((input.strategy === 'transfer' || input.strategy === 'hybrid') && input.transferQty > 0) {
      if (!input.sourceBranchId) throw new Error("Source Branch ID required for transfer");
      
      const transfer = await tx.transferOrder.create({
        data: {
          sourceBranchId: input.sourceBranchId,
          destBranchId: destBranchId,
          status: 'Draft',
          expectedArrival: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
          items: {
            create: {
              itemId: itemId,
              quantity: input.transferQty
            }
          }
        }
      });
      transferId = transfer.id;
      
      // Update donor branch stock: INCREASE reservedStock, do NOT reduce currentStock yet.
      // currentStock is reduced when physically dispatched.
      const donorInventory = await tx.branchInventory.findUnique({
        where: { branchId_itemId: { branchId: input.sourceBranchId, itemId: itemId } }
      });
      
      if (donorInventory) {
        await tx.branchInventory.update({
          where: { id: donorInventory.id },
          data: {
            reservedStock: { increment: input.transferQty }
          }
        });
      }
    }
    
    // 4. Update Decision Status and Create OutcomeRecord
    if (input.decisionId) {
      const decision = await tx.decision.update({
        where: { id: input.decisionId },
        data: { status: 'approved' }
      });
      
      const payload = JSON.parse(decision.dataPayload);
      await tx.outcomeRecord.create({
        data: {
          decisionId: decision.id,
          predictedDemand: payload.forecast?.expectedDailyDemand || 0,
          actualDemand: 0,
          accuracy: 0,
          stockoutAvoided: true,
          wasteAvoided: false,
          revenueProtected: decision.revenueAtRisk,
          supplierDeliveryStatus: 'Pending',
        }
      });
    } else {
      const existingDecision = await tx.decision.findFirst({
        where: { itemId: itemId, branchId: destBranchId, status: 'needs_review' }
      });
      
      if (existingDecision) {
        const decision = await tx.decision.update({
          where: { id: existingDecision.id },
          data: { status: 'approved' }
        });
        
        const payload = JSON.parse(decision.dataPayload);
        await tx.outcomeRecord.create({
          data: {
            decisionId: decision.id,
            predictedDemand: payload.forecast?.expectedDailyDemand || 0,
            actualDemand: 0,
            accuracy: 0,
            stockoutAvoided: true,
            wasteAvoided: false,
            revenueProtected: decision.revenueAtRisk,
            supplierDeliveryStatus: 'Pending',
          }
        });
      } else {
        const decision = await tx.decision.create({
          data: {
            itemId: itemId,
            branchId: destBranchId,
            riskLevel: 'Critical',
            revenueAtRisk: 0,
            status: 'approved',
            dataPayload: JSON.stringify(input)
          }
        });
        // We do not have a robust payload here to log an accurate OutcomeRecord without engine output, but we can do a generic one.
        await tx.outcomeRecord.create({
          data: {
            decisionId: decision.id,
            predictedDemand: 0,
            actualDemand: 0,
            accuracy: 0,
            stockoutAvoided: true,
            wasteAvoided: false,
            revenueProtected: 0,
            supplierDeliveryStatus: 'Pending',
          }
        });
      }
    }

    return { success: true, poId, transferId };
  });
}
