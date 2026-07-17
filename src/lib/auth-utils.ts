import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function validateUserAccess(branchId?: string | null) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("__session")?.value;
  if (!sessionToken) throw new Error("Unauthorized");

  let userId: string;
  try {
    const payloadBase64 = sessionToken.split('.')[1];
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
    userId = payload.sub;
  } catch (err) {
    throw new Error("Invalid session token");
  }
  
  if (!userId) throw new Error("Unauthorized");

  let user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { branchAccess: true }
  });

  if (!user) {
    let email = "user@example.com";
    let name = "New User";
    
    // We can fetch from Clerk REST API if we have the Secret Key, else fallback
    if (process.env.CLERK_SECRET_KEY) {
      try {
        const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
          headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` }
        });
        if (res.ok) {
          const clerkData = await res.json();
          email = clerkData.email_addresses?.[0]?.email_address || email;
          name = `${clerkData.first_name || ""} ${clerkData.last_name || ""}`.trim() || name;
        }
      } catch (e) {
        // ignore
      }
    }

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
