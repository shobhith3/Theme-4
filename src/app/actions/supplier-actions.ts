'use server';

import prisma from '@/lib/prisma';
import { validateUserAccess } from '@/lib/auth-utils';

export async function getSuppliers() {
  const { user } = await validateUserAccess();
  
  const suppliers = await prisma.supplier.findMany({
    where: {
      organizationId: user.organizationId
    },
    include: {
      supplierItems: {
        include: { item: true }
      },
      purchaseOrders: {
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          status: true,
          createdAt: true,
          items: true
        }
      }
    }
  });

  return suppliers.map(s => {
    // Collect unique categories from supplier items
    const categories = Array.from(new Set(s.supplierItems.map(si => si.item.category)));
    
    return {
      id: s.id,
      name: s.name,
      itemCategories: categories.length > 0 ? categories : ["General"],
      avgLeadTimeDays: s.leadTimeDays,
      onTimeDeliveryRate: 95 + Math.floor(Math.random() * 5), // Mock for now, could be derived from PO delivery vs expected
      defectRate: Math.floor(Math.random() * 3), // Mock
      reliabilityScore: s.reliability,
      recentOrders: s.purchaseOrders.map(po => {
        const amount = po.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
        return {
          id: po.id,
          poNumber: `PO-${po.id.slice(-6).toUpperCase()}`,
          date: po.createdAt.toISOString(),
          amount: amount,
          status: po.status
        };
      })
    };
  });
}
