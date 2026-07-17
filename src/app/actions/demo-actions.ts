'use server';

import { getPrisma } from './engine-actions';

export async function triggerDemandSpike() {
  const prisma = await getPrisma();
  
  // Create a large consumption transaction to drop stock dramatically
  const sku = 'D-2048';
  const branchName = 'Hyderabad Central';
  
  const item = await prisma.item.findFirst({ where: { sku }});
  const branch = await prisma.branch.findFirst({ where: { name: branchName }});
  
  if (!item || !branch) return { success: false, error: 'Item or branch not found' };
  
  const inventory = await prisma.branchInventory.findUnique({
    where: { branchId_itemId: { branchId: branch.id, itemId: item.id } }
  });
  
  if (!inventory) return { success: false, error: 'Inventory not found' };
  
  await prisma.$transaction([
    prisma.stockTransaction.create({
      data: {
        inventoryId: inventory.id,
        itemId: item.id,
        quantity: 20, // large spike
        direction: -1,
        type: 'CONSUMPTION',
        date: new Date()
      }
    }),
    prisma.branchInventory.update({
      where: { id: inventory.id },
      data: { currentStock: { decrement: 20 } }
    })
  ]);
  
  return { success: true };
}

export async function resetDemo() {
  const { exec } = require('child_process');
  const util = require('util');
  const execAsync = util.promisify(exec);
  
  try {
    await execAsync('npx tsx prisma/seed.ts');
    return { success: true };
  } catch (error: any) {
    console.error("Reset demo failed", error);
    return { success: false, error: error.message };
  }
}
