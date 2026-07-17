'use server';

import prisma from '@/lib/prisma';
import { validateUserAccess } from '@/lib/auth-utils';

export async function getIntelligenceMetrics() {
  const { user } = await validateUserAccess();

  // Fetch all outcome records for the organization
  const outcomes = await prisma.outcomeRecord.findMany({
    where: {
      decision: {
        branch: {
          organizationId: user.organizationId
        }
      }
    },
    include: {
      decision: true
    }
  });

  const totalDecisions = outcomes.length;
  
  const totalRevenueProtected = outcomes.reduce((sum, o) => sum + o.revenueProtected, 0);
  
  const stockoutsAvoided = outcomes.filter(o => o.stockoutAvoided).length;
  const wasteAvoided = outcomes.filter(o => o.wasteAvoided).length;
  
  const avgAccuracy = totalDecisions > 0 
    ? outcomes.reduce((sum, o) => sum + o.accuracy, 0) / totalDecisions 
    : 0;

  // Let's also get recent outcomes for a list
  const recentOutcomes = outcomes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5).map(o => {
    const payload = JSON.parse(o.decision.dataPayload || "{}");
    return {
      id: o.id,
      decisionType: payload.type || "procure",
      accuracy: o.accuracy,
      revenueProtected: o.revenueProtected,
      stockoutAvoided: o.stockoutAvoided,
      wasteAvoided: o.wasteAvoided,
      createdAt: o.createdAt.toISOString()
    };
  });

  return {
    totalRevenueProtected,
    stockoutsAvoided,
    wasteAvoided,
    avgAccuracy,
    totalDecisions,
    recentOutcomes
  };
}

export async function getForecasts() {
  const { user } = await validateUserAccess();
  
  const forecasts = await prisma.forecast.findMany({
    where: {
      branch: {
        organizationId: user.organizationId
      }
    },
    include: {
      item: true,
      branch: true
    },
    orderBy: { date: 'asc' },
    take: 100
  });

  return forecasts.map(f => ({
    id: f.id,
    itemId: f.itemId,
    itemName: f.item.name,
    branchName: f.branch.name,
    predictedDemand: f.expectedDemand,
    confidence: f.confidence,
    date: f.date.toISOString(),
    factors: ["Historical trend", "Seasonality"]
  }));
}
