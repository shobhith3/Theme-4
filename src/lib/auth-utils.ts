import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function validateUserAccess(branchId?: string | null) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { branchAccess: true }
  });

  if (!user) {
    const { currentUser } = await import('@clerk/nextjs/server');
    const clerkUser = await currentUser();
    if (!clerkUser) throw new Error("User not found in Clerk");

    let org = await prisma.organization.findFirst({
      where: { name: "FreshEats Co." }
    });

    if (!org) {
      org = await prisma.organization.create({
        data: { name: "FreshEats Co." }
      });
    }

    user = await prisma.user.create({
      data: {
        clerkUserId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || "no-email@example.com",
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "New User",
        role: "OWNER",
        organizationId: org.id,
      },
      include: { branchAccess: true }
    });
  }

  if (branchId) {
    const hasAccess = user.branchAccess.some(ba => ba.branchId === branchId);
    if (!hasAccess && user.role !== 'OWNER' && user.role !== 'ADMIN') {
      throw new Error(`User does not have access to branch ${branchId}`);
    }
  }

  return { user, organizationId: user.organizationId };
}
