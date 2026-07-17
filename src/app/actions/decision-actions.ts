'use server';

import { getPrisma } from './engine-actions';
import { Recommendation } from '@/types';
import { validateUserAccess } from '@/lib/auth-utils';

export async function getPendingDecisions(): Promise<Recommendation[]> {
  const prisma = await getPrisma();
  
  const { user } = await validateUserAccess();

  const decisions = await prisma.decision.findMany({
    where: { 
      status: { in: ['new', 'needs_review'] },
      branch: { organizationId: user.organizationId }
    },
    include: { item: true, branch: true },
    orderBy: { revenueAtRisk: 'desc' }
  });

  return decisions.map(d => {
    // Parse the engine output stored in dataPayload
    const payload = JSON.parse(d.dataPayload);
    const chosenOption = payload.chosenOption?.option;
    
    // Default mapping
    let type: "procure" | "transfer" | "reduce" | "expedite" | "hybrid" = "procure";
    let suggestedQty = payload.chosenOption?.recommendedQuantity || 0;
    let supplierId;
    let supplierName;
    let sourceBranchId;
    let sourceBranchName;
    let transferFeasibility;
    let hybridDetails;
    let estimatedCost = 0;
    let estimatedSavings = 0;

    if (chosenOption) {
      if (chosenOption.type === 'PURCHASE') {
        type = "procure";
        supplierId = chosenOption.supplierId;
        supplierName = chosenOption.name;
        estimatedCost = chosenOption.unitCost * suggestedQty;
      } else if (chosenOption.type === 'TRANSFER') {
        type = "transfer";
        sourceBranchId = chosenOption.donorBranchId;
        sourceBranchName = chosenOption.name;
        transferFeasibility = {
          feasible: true,
          distanceKm: 0,
          travelTimeHours: chosenOption.travelTimeDays * 24,
          transferCost: 0,
          purchaseAvoided: suggestedQty * d.item.unitRevenue,
          reason: "Sufficient donor stock"
        };
      } else if (chosenOption.type === 'HYBRID') {
        type = "hybrid";
        sourceBranchId = chosenOption.transferOption.donorBranchId;
        sourceBranchName = chosenOption.transferOption.name;
        supplierId = chosenOption.purchaseOption.supplierId;
        supplierName = chosenOption.purchaseOption.name;
        hybridDetails = {
          transferQty: chosenOption.transferQuantity,
          purchaseQty: chosenOption.purchaseQuantity
        };
        estimatedCost = chosenOption.purchaseOption.unitCost * chosenOption.purchaseQuantity;
      }
    }

    let urgency: "critical" | "high" | "medium" | "low" = "low";
    if (d.riskLevel === 'Critical') urgency = "critical";
    else if (d.riskLevel === 'High') urgency = "high";
    else if (d.riskLevel === 'Medium') urgency = "medium";

    return {
      id: d.id,
      type,
      itemId: d.itemId,
      itemName: d.item.name,
      branchId: d.branchId,
      branchName: d.branch.name,
      urgency,
      suggestedQty,
      unit: d.item.unit,
      estimatedCost,
      estimatedSavings,
      revenueAtRisk: d.revenueAtRisk,
      reasoning: d.aiExplanation || "Review recommended.",
      status: d.status as any,
      createdAt: d.createdAt.toISOString(),
      expiresAt: new Date(d.createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      supplierId,
      supplierName,
      sourceBranchId,
      sourceBranchName,
      confidenceScore: payload.confidence || 80,
      timeToBreach: `${Math.round(payload.metrics?.timeToBreach || 0)} days`,
      transferFeasibility,
      hybridDetails
    };
  });
}
