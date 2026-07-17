'use server';

import { getEngineDecisionForSku, getPrisma } from './engine-actions';
import { generateExplanation } from '../../lib/llm';
import { validateUserAccess } from '@/lib/auth-utils';

export async function runFullRiskScan() {
  const prisma = await getPrisma();
  
  // Scope scan to current user's organization
  const { user } = await validateUserAccess();
  
  try {
    const inventories = await prisma.branchInventory.findMany({
      where: { branch: { organizationId: user.organizationId } },
      include: { item: true, branch: true }
    });

    let newDecisionsCount = 0;

    for (const inv of inventories) {
      // 1. Run deterministic engine
      const engineOutput = await getEngineDecisionForSku(inv.item.sku, inv.branch.name);
      
      // If no risk, clear existing decision if any
      if (engineOutput.riskLevel === 'Low') {
        await prisma.decision.deleteMany({
          where: { itemId: inv.itemId, branchId: inv.branchId, status: 'needs_review' }
        });
        continue;
      }
      
      // Check if we already have an active decision for this item/branch
      const existing = await prisma.decision.findFirst({
        where: { itemId: inv.itemId, branchId: inv.branchId, status: 'needs_review' }
      });

      // 2. Generate LLM Explanation
      const input = {
        itemSku: inv.item.sku,
        itemName: inv.item.name,
        branchName: inv.branch.name,
        category: inv.item.category,
        history: [],
        currentStock: engineOutput.metrics.usableStock,
        reservedStock: inv.reservedStock,
        expiredOrDamaged: 0,
        confirmedIncoming: 0,
        safeStock: inv.safeStock,
        safeCoverDays: inv.safeCoverDays,
        leadTime: 2,
        unitRevenue: inv.item.unitRevenue,
        riskWindowDays: 7,
        currentDate: new Date(), // Real time, or mock date '2025-05-21'
        transferOptions: [],
        purchaseOptions: []
      };
      
      const explanation = await generateExplanation(input, engineOutput);
      
      // 3. Store in database
      if (existing) {
        await prisma.decision.update({
          where: { id: existing.id },
          data: {
            riskLevel: engineOutput.riskLevel,
            revenueAtRisk: engineOutput.metrics.revenueAtRisk,
            aiExplanation: explanation,
            dataPayload: JSON.stringify(engineOutput)
          }
        });
      } else {
        await prisma.decision.create({
          data: {
            itemId: inv.itemId,
            branchId: inv.branchId,
            riskLevel: engineOutput.riskLevel,
            revenueAtRisk: engineOutput.metrics.revenueAtRisk,
            status: 'needs_review',
            aiExplanation: explanation,
            dataPayload: JSON.stringify(engineOutput)
          }
        });
        newDecisionsCount++;
      }
    }
    
    return { success: true, message: `Scan complete. Found ${newDecisionsCount} new decisions.` };
  } catch (error: any) {
    console.error("Risk scan failed", error);
    return { success: false, error: error.message };
  }
}
