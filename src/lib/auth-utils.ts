import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function validateUserAccess(branchId?: string | null) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("procureiq_session")?.value;
  if (!sessionToken) throw new Error("Unauthorized");

  let sessionData: { email: string; name: string };
  try {
    sessionData = JSON.parse(sessionToken);
  } catch (err) {
    throw new Error("Invalid session token");
  }

  const { email, name } = sessionData;
  if (!email) throw new Error("Unauthorized");

  let user = await prisma.user.findUnique({
    where: { email },
    include: { branchAccess: true }
  });

  if (!user) {
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
        clerkUserId: `demo_${Date.now()}`, // Keep field for schema compatibility
        email,
        name,
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
