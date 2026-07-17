'use server';

import prisma from '@/lib/prisma';
import { validateUserAccess } from '@/lib/auth-utils';
import { Branch, InventoryItem } from '@/types';

export async function getOrganizationBranches(): Promise<any[]> {
  const { user, role } = await validateUserAccess();

  // Fetch branches. If Regional/Admin, they might have access to all or specific. 
  // Based on schema, we map from branchAccess.
  const branchIds = user.branchAccess.map(ba => ba.branchId);
  const dbBranches = await prisma.branch.findMany({
    where: {
      organizationId: user.organizationId,
      ...((role === 'OWNER' || role === 'ADMIN' || role === 'REGIONAL_MANAGER') ? {} : { id: { in: branchIds } })
    }
  });

  // Map to the frontend type
  return dbBranches.map(b => ({
    id: b.id,
    name: b.name,
    organizationId: b.organizationId,
    type: b.type as "central" | "hub" | "branch",
    city: "Default City",
    code: b.name.slice(0, 3).toUpperCase(),
    isActive: true,
    address: "Default Address",
    coordinates: { lat: 0, lng: 0 }
  }));
}

export async function getBranchInventory(branchId?: string): Promise<any[]> {
  const { user, role } = await validateUserAccess();
  
  const branchIds = user.branchAccess.map(ba => ba.branchId);

  const dbInventory = await prisma.branchInventory.findMany({
    where: {
      branch: {
        organizationId: user.organizationId,
      },
      ...((role === 'OWNER' || role === 'ADMIN' || role === 'REGIONAL_MANAGER') 
          ? (branchId ? { branchId } : {}) 
          : { branchId: branchId ? branchId : { in: branchIds } })
    },
    include: {
      item: true,
      branch: true
    }
  });

  return dbInventory.map(inv => ({
    id: inv.item.id,
    sku: inv.item.sku,
    name: inv.item.name,
    category: inv.item.category,
    unit: inv.item.unit,
    branchId: inv.branchId,
    branchName: inv.branch.name,
    currentStock: inv.currentStock,
    reservedStock: inv.reservedStock || 0,
    safeStock: inv.safeStock,
    reorderLevel: inv.safeStock, // fallback
    status: inv.currentStock < inv.safeStock ? 'critical' : 'optimal', // derived
    priority: inv.currentStock < inv.safeStock ? 'high' : 'low',
    lastRestocked: inv.updatedAt.toISOString(),
  }));
}
