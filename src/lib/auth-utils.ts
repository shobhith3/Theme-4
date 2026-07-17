import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function validateUserAccess(branchId?: string | null) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { branchAccess: true }
  });

  if (!user) throw new Error("User not found in system. Please sign in again.");

  if (branchId) {
    const hasAccess = user.branchAccess.some(ba => ba.branchId === branchId);
    if (!hasAccess && user.role !== 'OWNER' && user.role !== 'ADMIN') {
      throw new Error(`User does not have access to branch ${branchId}`);
    }
  }

  return { user, organizationId: user.organizationId };
}
